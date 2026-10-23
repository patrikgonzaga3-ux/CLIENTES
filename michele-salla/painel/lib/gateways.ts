// Traduz o aviso (webhook) de cada gateway para uma linha da tabela pl_eventos (ou pl_abandonos).
// Sem imports: roda na rota do webhook e nos testes (node --test).
//
// Greenn e Hotmart: portados dos webhooks que rodam há meses no painel da Laura Rosa (campos conferidos em
// vendas reais). Kiwify: escrito pela documentação pública; o aviso inteiro fica em `raw` e a 1ª venda real
// deve ser conferida (docs/ONBOARDING_CLIENTE.md, passo 6). Outro gateway = uma função nova aqui + o nome em
// GATEWAYS e no cliente.config.ts.

export type Status = 'aprovada' | 'reembolsada' | 'chargeback' | 'aguardando' | 'recusada' | 'criada' | 'cancelada' | 'outro'
export type Evento = {
  event_key: string
  gateway: string
  status: Status
  status_original: string | null
  transacao: string
  produto_id: string | null
  produto_nome: string | null
  oferta: string | null
  valor: number | null // o que o cliente pagou
  liquido: number | null // o que sobra para o produtor depois da taxa do gateway (quando o gateway manda)
  metodo: string | null
  parcelas: number | null
  nome: string | null
  email: string | null
  telefone: string | null
  src: string | null // utm_term = id do conjunto de anúncios
  sck: string | null // utm_source = página / origem
  xcod: string | null
  utm_campaign: string | null
  utm_content: string | null // nome do anúncio
  renovacao: boolean
  data_pedido: string | null
  data_aprovacao: string | null
  raw: unknown
}
export type Abandono = {
  event_key: string
  gateway: string
  produto_id: string | null
  produto_nome: string | null
  valor: number | null
  nome: string | null
  email: string | null
  telefone: string | null
  sck: string | null
  src: string | null
  quando: string | null
  raw: unknown
}
export type Resultado = { tipo: 'venda'; evento: Evento } | { tipo: 'abandono'; abandono: Abandono } | { tipo: 'ignorado'; motivo: string }

export const GATEWAYS = ['greenn', 'hotmart', 'kiwify'] as const
export type Gateway = (typeof GATEWAYS)[number]

/* eslint-disable @typescript-eslint/no-explicit-any */
function pick(...vals: unknown[]): any {
  for (const v of vals) if (v !== undefined && v !== null && v !== '') return v
  return null
}
const str = (v: unknown) => (v === undefined || v === null || v === '' ? null : String(v))
const num = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) && v !== null && v !== '' ? n : null
}

/** Data em ISO. Com fuso (Z ou ±HH:MM) respeita; sem fuso assume Brasília (-03:00); número = epoch em ms. */
export function paraISO(v: unknown): string | null {
  if (v === undefined || v === null || v === '') return null
  if (typeof v === 'number') {
    const d = new Date(v < 1e12 ? v * 1000 : v)
    return Number.isFinite(d.getTime()) ? d.toISOString() : null
  }
  const s = String(v).trim()
  if (/^\d{10,13}$/.test(s)) return paraISO(Number(s))
  if (/([zZ]|[+-]\d{2}:?\d{2})$/.test(s)) {
    const d = new Date(s)
    return Number.isFinite(d.getTime()) ? d.toISOString() : null
  }
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/)
  if (m) {
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6] ?? '00'}-03:00`)
    return Number.isFinite(d.getTime()) ? d.toISOString() : null
  }
  const d = new Date(s)
  return Number.isFinite(d.getTime()) ? d.toISOString() : null
}

function statusDe(v: unknown): Status {
  const s = String(v ?? '').toLowerCase().replace(/[\s-]/g, '_')
  if (['paid', 'approved', 'complete', 'completed', 'aprovada', 'order_approved', 'purchase_approved', 'purchase_complete'].includes(s)) return 'aprovada'
  if (['refunded', 'reembolsada', 'order_refunded', 'purchase_refunded'].includes(s)) return 'reembolsada'
  if (['chargedback', 'chargeback', 'purchase_chargeback', 'purchase_protest', 'dispute'].includes(s)) return 'chargeback'
  if (['waiting_payment', 'pending', 'billet_printed', 'pix_created', 'billet_created', 'purchase_billet_printed', 'purchase_waiting_payment', 'waiting', 'purchase_delayed', 'delayed'].includes(s)) return 'aguardando'
  if (['refused', 'order_rejected', 'purchase_refused', 'declined', 'rejected'].includes(s)) return 'recusada'
  if (['created', 'purchase_created'].includes(s)) return 'criada'
  if (['canceled', 'cancelled', 'purchase_canceled', 'purchase_expired', 'expired'].includes(s)) return 'cancelada'
  return 'outro'
}

// ── Greenn ──────────────────────────────────────────────────────────────
// Confirmado em vendas reais (Laura, 2026): sale.amount = pago; sale.seller_balance = líquido do produtor;
// datas em UTC com Z; rastreio em saleMetas [{meta_key, meta_value}]; o mesmo sale.id se repete a cada status.
function metasGreenn(metas: unknown): Record<string, any> {
  const map: Record<string, any> = {}
  if (Array.isArray(metas)) for (const m of metas) {
    const k = pick(m?.meta_key, m?.key, m?.name)
    if (k != null) map[String(k).toLowerCase().trim()] = pick(m?.meta_value, m?.value)
  }
  return map
}
export function greenn(body: any): Resultado {
  const data = body?.data ?? body
  const tipo = String(pick(body?.type, data?.type) ?? '').toLowerCase()
  const nomeEv = String(pick(body?.event, data?.event) ?? '').toLowerCase()
  const sale = data?.sale ?? data?.transaction ?? {}
  const product = data?.product ?? {}
  const client = data?.client ?? data?.buyer ?? data?.customer ?? {}
  const metas = metasGreenn(data?.saleMetas ?? data?.sale_metas ?? body?.saleMetas)
  if (tipo === 'lead' || nomeEv.startsWith('lead')) {
    const lead = data?.lead ?? data?.checkout ?? {}
    const pessoa = { ...client, ...(lead?.client ?? lead?.buyer ?? lead?.customer ?? {}) }
    const lm = { ...metas, ...metasGreenn(lead?.leadMetas ?? lead?.metas ?? data?.leadMetas) }
    const id = str(pick(lead?.id, data?.lead_id, data?.id))
    const st = String(pick(data?.currentStatus, lead?.status) ?? 'na').toLowerCase()
    if (!id) return { tipo: 'ignorado', motivo: 'lead sem id' }
    return { tipo: 'abandono', abandono: {
      event_key: `greenn-lead-${id}-${st}`, gateway: 'greenn',
      produto_id: str(pick(product?.id, lead?.product_id)), produto_nome: pick(product?.name, lead?.product_name),
      valor: num(pick(data?.offer?.amount, lead?.amount, product?.amount)),
      nome: pick(pessoa?.name, lead?.name), email: pick(pessoa?.email, lead?.email), telefone: str(pick(pessoa?.cellphone, pessoa?.phone, lead?.cellphone, lead?.phone)),
      sck: pick(lm.sck, lm.utm_source), src: pick(lm.utm_term, lm.src),
      quando: paraISO(pick(lead?.updated_at, lead?.created_at, data?.updated_at, data?.created_at)), raw: body,
    } }
  }
  const ehVenda = tipo === 'sale' || nomeEv === 'saleupdated' || !!(sale && (sale.id || sale.status))
  if (!ehVenda) return { tipo: 'ignorado', motivo: `evento ${tipo || nomeEv || '?'}` }
  const stOrig = str(pick(data?.currentStatus, data?.current_status, sale?.status))
  const st = statusDe(stOrig)
  const id = str(pick(sale?.id, data?.sale_id, data?.id))
  if (!id) return { tipo: 'ignorado', motivo: 'venda sem id' }
  return { tipo: 'venda', evento: {
    event_key: `greenn-${id}-${String(stOrig ?? 'na').toLowerCase()}`, gateway: 'greenn', status: st, status_original: stOrig, transacao: id,
    produto_id: str(pick(product?.id, product?.product_id)), produto_nome: pick(product?.name, product?.title),
    oferta: str(pick(data?.offer?.hash, data?.offer?.code, product?.offer)),
    valor: num(pick(sale?.amount, sale?.total, product?.amount)),
    liquido: num(pick(sale?.seller_balance, sale?.net_amount, sale?.liquid_amount)),
    metodo: pick(sale?.method, sale?.payment_method), parcelas: num(pick(sale?.installments, sale?.installment)),
    nome: pick(client?.name, client?.full_name), email: pick(client?.email), telefone: str(pick(client?.cellphone, client?.phone, client?.cell_phone)),
    src: pick(metas.utm_term, metas.src), sck: pick(metas.sck, metas.utm_source), xcod: pick(metas.xcod),
    utm_campaign: pick(metas.utm_campaign), utm_content: pick(metas.utm_content),
    renovacao: Number(pick(data?.charge, sale?.charge)) > 1,
    data_pedido: paraISO(pick(sale?.created_at, data?.created_at)),
    data_aprovacao: st === 'aprovada' ? paraISO(pick(sale?.paid_at, sale?.updated_at)) : null,
    raw: body,
  } }
}

// ── Hotmart (webhook v2) ────────────────────────────────────────────────
// Confirmado em vendas reais (Laura): rastreio em purchase.origin (src/sck/xcod); valores em purchase.price.value;
// líquido do produtor em commissions[source=PRODUCER]; datas em milissegundos.
export function hotmart(body: any): Resultado {
  const data = body?.data ?? body
  const purchase = data?.purchase ?? {}
  const buyer = data?.buyer ?? {}
  const product = data?.product ?? {}
  const origin = purchase?.origin ?? purchase?.tracking ?? {}
  const ev = String(pick(body?.event, data?.event) ?? '')
  if (/CART_ABANDONMENT/i.test(ev)) {
    const id = str(pick(body?.id, data?.buyer?.email))
    if (!id) return { tipo: 'ignorado', motivo: 'abandono sem id' }
    return { tipo: 'abandono', abandono: {
      event_key: `hotmart-abandono-${id}`, gateway: 'hotmart', produto_id: str(pick(product?.id)), produto_nome: pick(product?.name),
      valor: null, nome: pick(buyer?.name), email: pick(buyer?.email), telefone: str(pick(buyer?.phone, buyer?.checkout_phone)),
      sck: pick(origin?.sck), src: pick(origin?.src), quando: paraISO(pick(body?.creation_date)), raw: body,
    } }
  }
  const transacao = str(pick(purchase?.transaction, data?.transaction))
  if (!transacao) return { tipo: 'ignorado', motivo: `evento ${ev || '?'} sem transação` }
  const stOrig = str(pick(purchase?.status, ev))
  const st = statusDe(pick(ev, purchase?.status)) === 'outro' ? statusDe(purchase?.status) : statusDe(pick(ev, purchase?.status))
  let liquido: number | null = null
  const com = data?.commissions ?? []
  if (Array.isArray(com)) {
    const p = com.find((c: any) => String(c?.source ?? '').toUpperCase() === 'PRODUCER')
    if (p) liquido = num(p.value ?? p.amount)
  }
  return { tipo: 'venda', evento: {
    event_key: `hotmart-${transacao}-${String(stOrig ?? ev).toLowerCase()}`, gateway: 'hotmart', status: st, status_original: stOrig, transacao,
    produto_id: str(pick(product?.id, product?.ucode)), produto_nome: pick(product?.name), oferta: str(pick(purchase?.offer?.code)),
    valor: num(pick(purchase?.price?.value, purchase?.full_price?.value)), liquido,
    metodo: pick(purchase?.payment?.type), parcelas: num(purchase?.payment?.installments_number),
    nome: pick(buyer?.name), email: pick(buyer?.email), telefone: str(pick(buyer?.checkout_phone, buyer?.phone)),
    src: pick(origin?.src), sck: pick(origin?.sck), xcod: pick(origin?.xcod), utm_campaign: null, utm_content: null,
    renovacao: Number(pick(purchase?.recurrence_number)) > 1,
    data_pedido: paraISO(pick(purchase?.order_date)),
    data_aprovacao: st === 'aprovada' ? paraISO(pick(purchase?.approved_date, body?.creation_date)) : null,
    raw: body,
  } }
}

// ── Kiwify ──────────────────────────────────────────────────────────────
// Pela documentação pública: order_id, order_status, webhook_event_type, Product, Customer, Commissions
// (charge_amount e my_commission em centavos), TrackingParameters (src, sck, utm_*). Conferir na 1ª venda real.
export function kiwify(body: any): Resultado {
  const d = body?.order ?? body
  const ev = String(pick(d?.webhook_event_type, body?.webhook_event_type) ?? '')
  const tr = d?.TrackingParameters ?? d?.tracking_parameters ?? {}
  const cust = d?.Customer ?? d?.customer ?? {}
  const prod = d?.Product ?? d?.product ?? {}
  if (/abandon/i.test(ev)) {
    const id = str(pick(d?.id, d?.checkout_link, cust?.email))
    if (!id) return { tipo: 'ignorado', motivo: 'abandono sem id' }
    return { tipo: 'abandono', abandono: {
      event_key: `kiwify-abandono-${id}`, gateway: 'kiwify', produto_id: str(pick(prod?.product_id, d?.product_id)), produto_nome: pick(prod?.product_name, d?.product_name),
      valor: null, nome: pick(cust?.full_name, cust?.name, d?.name), email: pick(cust?.email, d?.email), telefone: str(pick(cust?.mobile, cust?.phone, d?.phone)),
      sck: pick(tr?.sck, tr?.utm_source), src: pick(tr?.utm_term, tr?.src), quando: paraISO(pick(d?.created_at)), raw: body,
    } }
  }
  const transacao = str(pick(d?.order_id, d?.id))
  if (!transacao) return { tipo: 'ignorado', motivo: `evento ${ev || '?'} sem pedido` }
  const stOrig = str(pick(d?.order_status, ev))
  const st = statusDe(stOrig) === 'outro' ? statusDe(ev) : statusDe(stOrig)
  const com = d?.Commissions ?? d?.commissions ?? {}
  const centavos = (v: unknown) => { const n = num(v); return n == null ? null : n / 100 }
  return { tipo: 'venda', evento: {
    event_key: `kiwify-${transacao}-${String(stOrig ?? ev).toLowerCase()}`, gateway: 'kiwify', status: st, status_original: stOrig, transacao,
    produto_id: str(pick(prod?.product_id, d?.product_id)), produto_nome: pick(prod?.product_name, d?.product_name), oferta: str(pick(prod?.product_offer_id, d?.offer_id)),
    valor: centavos(pick(com?.charge_amount, com?.product_base_price)), liquido: centavos(pick(com?.my_commission)),
    metodo: pick(d?.payment_method), parcelas: num(d?.installments),
    nome: pick(cust?.full_name, cust?.first_name), email: pick(cust?.email), telefone: str(pick(cust?.mobile, cust?.phone)),
    src: pick(tr?.utm_term, tr?.src), sck: pick(tr?.sck, tr?.utm_source), xcod: pick(tr?.xcod),
    utm_campaign: pick(tr?.utm_campaign), utm_content: pick(tr?.utm_content),
    renovacao: Number(pick(d?.Subscription?.charges?.completed?.length)) > 1,
    data_pedido: paraISO(pick(d?.created_at)), data_aprovacao: st === 'aprovada' ? paraISO(pick(d?.approved_date, d?.updated_at)) : null,
    raw: body,
  } }
}

export const NORMALIZA: Record<Gateway, (b: any) => Resultado> = { greenn, hotmart, kiwify }
