// Robô do gasto do Meta (de hora em hora): lê a conta de anúncio do cliente, dia a dia, por conjunto e por
// anúncio, e grava em pl_meta_conjuntos e pl_meta_anuncios. Variáveis: META_ACCESS_TOKEN (usuário do sistema
// da BM com ads_read na conta) e META_AD_ACCOUNT_ID (só o número, sem act_).
// Pedimos um dia por vez: pedindo vários dias de uma vez, o Meta já devolveu gasto zerado (visto em 21/10/2026).
import 'server-only'
import { gravar, marcarFonte } from './db'

const API = 'https://graph.facebook.com/v21.0'
type Acao = { action_type?: string; value?: string }
type Linha = Record<string, unknown> & { actions?: Acao[]; action_values?: Acao[] }
const n = (v: unknown) => { const x = Number(v); return Number.isFinite(x) ? x : null }
const acao = (arr: Acao[] | undefined, ...tipos: string[]) => {
  for (const t of tipos) { const a = (arr ?? []).find((x) => x.action_type === t); if (a) return Number(a.value) }
  return null
}
// Evento personalizado (quando o cliente otimiza por um evento próprio do pixel): META_EVENTO_COMPRA / META_EVENTO_CHECKOUT.
const custom = (arr: Acao[] | undefined, nome?: string) => (nome ? acao(arr, `offsite_conversion.fb_pixel_custom.${nome}`) : null)

function diaSP(off: number) {
  return new Date(Date.now() - off * 86_400_000).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

async function todasPaginas(url: string): Promise<Linha[]> {
  const out: Linha[] = []
  let prox: string | null = url
  for (let i = 0; prox && i < 20; i++) {
    const r: Response = await fetch(prox, { cache: 'no-store' })
    const j = await r.json() as { data?: Linha[]; paging?: { next?: string }; error?: { message?: string } }
    if (!r.ok || j.error) throw new Error(`Meta: ${j.error?.message ?? r.status}`)
    out.push(...(j.data ?? []))
    prox = j.paging?.next ?? null
  }
  return out
}

export async function sincronizarMeta(dias = 3): Promise<string> {
  const token = (process.env.META_ACCESS_TOKEN || '').trim()
  const conta = (process.env.META_AD_ACCOUNT_ID || '').replace(/\D/g, '')
  if (!token || !conta) { await marcarFonte('meta', false, 'falta META_ACCESS_TOKEN ou META_AD_ACCOUNT_ID'); return 'erro: Meta não configurado' }
  const evC = process.env.META_EVENTO_COMPRA, evI = process.env.META_EVENTO_CHECKOUT
  const tk = `&access_token=${encodeURIComponent(token)}`
  const campos = 'campaign_id,campaign_name,adset_id,adset_name,spend,impressions,clicks,inline_link_clicks,actions,action_values'
  try {
    let conj = 0, anun = 0, gasto = 0
    for (let d = dias - 1; d >= 0; d--) {
      const dia = diaSP(d)
      const tr = `&time_range=${encodeURIComponent(JSON.stringify({ since: dia, until: dia }))}&limit=500`
      const [cs, as] = await Promise.all([
        todasPaginas(`${API}/act_${conta}/insights?level=adset&fields=${campos}${tr}${tk}`),
        todasPaginas(`${API}/act_${conta}/insights?level=ad&fields=${campos},ad_id,ad_name${tr}${tk}`),
      ])
      const ic = (l: Linha) => custom(l.actions, evI) ?? acao(l.actions, 'offsite_conversion.fb_pixel_initiate_checkout', 'initiate_checkout')
      const compras = (l: Linha) => custom(l.actions, evC) ?? acao(l.actions, 'offsite_conversion.fb_pixel_purchase', 'purchase')
      const valor = (l: Linha) => custom(l.action_values, evC) ?? acao(l.action_values, 'offsite_conversion.fb_pixel_purchase', 'purchase')
      const agora = new Date().toISOString()
      const base = (l: Linha) => ({
        date: dia, campaign_id: l.campaign_id ?? null, campaign_name: l.campaign_name ?? null, adset_name: l.adset_name ?? null,
        spend: n(l.spend), impressions: n(l.impressions), link_clicks: n(l.inline_link_clicks) ?? acao(l.actions, 'link_click'),
        lp_views: acao(l.actions, 'landing_page_view'), ic: ic(l), purchases: compras(l), purchase_value: valor(l), updated_at: agora,
      })
      const r1 = await gravar('pl_meta_conjuntos', cs.map((l) => ({ ...base(l), adset_id: l.adset_id, clicks: n(l.clicks) })), 'adset_id,date')
      const r2 = await gravar('pl_meta_anuncios', as.map((l) => ({ ...base(l), adset_id: l.adset_id, ad_id: l.ad_id, ad_name: l.ad_name ?? null })), 'ad_id,date')
      if (!r1.ok || !r2.ok) throw new Error(`banco: ${r1.erro || r2.erro}`)
      conj += cs.length; anun += as.length; gasto += cs.reduce((a, l) => a + (n(l.spend) ?? 0), 0)
    }
    const txt = `conta ${conta}: ${dias} dias, ${conj} linhas de conjunto, ${anun} de anúncio, gasto R$ ${gasto.toFixed(2)}`
    await marcarFonte('meta', true, txt, conj)
    return txt
  } catch (e) {
    const txt = e instanceof Error ? e.message : String(e)
    await marcarFonte('meta', false, txt)
    return `erro: ${txt}`
  }
}
