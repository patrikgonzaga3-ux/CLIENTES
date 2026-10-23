// MODO DEMONSTRAÇÃO (DEMO=1): dados fictícios e coerentes, para mostrar o painel a um cliente antes de ligar
// os dados dele e para testar as telas. Sempre os mesmos números para o mesmo dia (sorteio com semente).
// Nada aqui é de cliente de verdade.
import { CLIENTE } from '@/cliente.config'
import type { Abandono, Compra, Fonte, MetaDia, Visita } from './dados'
import type { Gasto } from './lucro'

const DIA = 86_400_000
const JANELA = 100 // dias de histórico fictício
function rng(semente: string) {
  let h = 1779033703 ^ semente.length
  for (let i = 0; i < semente.length; i++) h = Math.imul(h ^ semente.charCodeAt(i), 3432918353), (h = (h << 13) | (h >>> 19))
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296 }
}
const diaSP = (t: number) => new Date(t).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
const dias = () => Array.from({ length: JANELA }, (_, i) => diaSP(Date.now() - (JANELA - 1 - i) * DIA))
const site = () => CLIENTE.sites[0]
const ticket = () => CLIENTE.ticket || 97

const CONJ = [
  { adset_id: '120200000000000001', adset_name: 'ABERTO - MULHERES 30+', campaign_id: 'c1', campaign_name: 'VENDAS - PÁGINA A', peso: 1.3, ads: ['V1 - DEPOIMENTO', 'V2 - ANTES DA COMPRA'] },
  { adset_id: '120200000000000002', adset_name: 'INTERESSES - EMAGRECIMENTO', campaign_id: 'c1', campaign_name: 'VENDAS - PÁGINA A', peso: 0.9, ads: ['V1 - DEPOIMENTO', 'V3 - ROTINA REAL'] },
  { adset_id: '120200000000000003', adset_name: 'ABERTO - TODAS', campaign_id: 'c2', campaign_name: 'VENDAS - PÁGINA B', peso: 1.0, ads: ['V4 - PROMESSA DIRETA', 'V5 - PERGUNTA'] },
  { adset_id: '120200000000000004', adset_name: 'REMARKETING 7 DIAS', campaign_id: 'c2', campaign_name: 'VENDAS - PÁGINA B', peso: 0.5, ads: ['V6 - ÚLTIMA CHAMADA'] },
]

type Dia = { dia: string; meta: MetaDia[]; ads: MetaDia[]; pedidos: Compra[]; abandonos: Abandono[] }
let cache: { chave: string; dias: Dia[] } | null = null
function gerar(): Dia[] {
  const chave = diaSP(Date.now())
  if (cache?.chave === chave) return cache.dias
  const out: Dia[] = []
  for (const dia of dias()) {
    const r = rng(dia)
    const hoje = dia === chave
    const fracDia = hoje ? Math.min(1, (Date.now() - Date.parse(`${dia}T03:00:00Z`)) / DIA) : 1
    const meta: MetaDia[] = [], ads: MetaDia[] = []
    for (const c of CONJ) {
      const spend = Math.round((70 + r() * 90) * c.peso * fracDia * 100) / 100
      const cliques = Math.round(spend / (1.9 + r() * 1.4))
      const ic = Math.round(cliques * (0.09 + r() * 0.07))
      const compras = Math.round(ic * (0.25 + r() * 0.2))
      const linha = { date: dia, adset_id: c.adset_id, adset_name: c.adset_name, campaign_id: c.campaign_id, campaign_name: c.campaign_name, spend, link_clicks: cliques, lp_views: Math.round(cliques * 0.78), ic, purchases: compras, purchase_value: compras * ticket(), impressions: cliques * 70 }
      meta.push({ ...linha, id: c.adset_id, nome: c.adset_name })
      c.ads.forEach((ad, i) => {
        const f = c.ads.length === 1 ? 1 : i === 0 ? 0.6 : 0.4
        ads.push({ ...linha, id: `${c.adset_id}-${i}`, nome: ad, spend: Math.round(spend * f * 100) / 100, link_clicks: Math.round(cliques * f), lp_views: Math.round(cliques * f * 0.78), ic: Math.round(ic * f), purchases: Math.round(compras * f), purchase_value: Math.round(compras * f) * ticket() })
      })
    }
    // vendas: ~1 a cada R$ 38 de anúncio + algumas sem anúncio (orgânico / WhatsApp)
    const gasto = meta.reduce((a, m) => a + m.spend, 0)
    const nVendas = Math.round(gasto / (30 + r() * 18)) + (r() < 0.5 ? 1 : 0)
    const pedidos: Compra[] = []
    const paginas = site().paginas.map((p) => p[0])
    const base0 = Date.parse(`${dia}T03:00:00Z`)
    const mk = (i: number, status: string, valor: number, produto: string, extra: Partial<Compra> = {}): Compra => {
      const t = base0 + Math.floor(r() * DIA * fracDia)
      const c = CONJ[Math.floor(r() * CONJ.length)]
      const anuncio = r() < 0.85
      return {
        transacao: `demo-${dia}-${i}`, gateway: CLIENTE.gateways[0] ?? 'greenn', produto_id: produto === 'principal' ? 'p1' : 'p2', produto_nome: produto === 'principal' ? 'Produto principal' : 'Order bump',
        valor, liquido: Math.round(valor * 0.9 * 100) / 100, aprovada_em: status === 'aprovada' || status === 'reembolsada' ? new Date(t).toISOString() : null,
        reembolsada_em: null, pedido_em: new Date(t - 120_000).toISOString(), ultimo_status: status, viva: status === 'aprovada', teste: false,
        src: anuncio ? c.adset_id : null, sck: paginas[Math.floor(r() * paginas.length)] ?? null, xcod: null, utm_content: anuncio ? c.ads[0] : null,
        email: `cliente${i}@exemplo.com`, nome: ['Ana Souza', 'Bruna Lima', 'Carla Dias', 'Débora Melo', 'Elaine Reis'][i % 5], telefone: `55119${String(10000000 + Math.floor(r() * 89999999))}`,
        metodo: r() < 0.55 ? 'pix' : 'credit_card', renovacao: false, ...extra,
      }
    }
    for (let i = 0; i < nVendas; i++) {
      const devolvida = r() < 0.04
      const v = mk(i, devolvida ? 'reembolsada' : 'aprovada', ticket(), 'principal')
      if (devolvida) Object.assign(v, { viva: false, reembolsada_em: new Date(Date.parse(v.aprovada_em as string) + 3 * DIA).toISOString() })
      pedidos.push(v)
      if (r() < 0.3) pedidos.push(mk(100 + i, 'aprovada', 27, 'bump', { src: v.src, sck: v.sck, aprovada_em: v.aprovada_em }))
    }
    const nPend = Math.round(nVendas * (0.3 + r() * 0.2)), nRec = Math.round(nVendas * 0.15)
    for (let i = 0; i < nPend; i++) pedidos.push(mk(200 + i, 'aguardando', ticket(), 'principal', { metodo: 'pix' }))
    for (let i = 0; i < nRec; i++) pedidos.push(mk(300 + i, 'recusada', ticket(), 'principal', { metodo: 'credit_card' }))
    const abandonos: Abandono[] = Array.from({ length: Math.round(nVendas * 0.4) }, (_, i) => ({
      event_key: `demo-ab-${dia}-${i}`, produto_nome: 'Produto principal', valor: ticket(), nome: ['Fernanda Alves', 'Gabriela Rocha', 'Helena Costa'][i % 3],
      email: `lead${i}@exemplo.com`, telefone: `55119${String(20000000 + Math.floor(r() * 79999999))}`, sck: paginas[0] ?? null,
      quando: new Date(base0 + Math.floor(r() * DIA * fracDia)).toISOString(), recebido_em: new Date(base0 + Math.floor(r() * DIA * fracDia)).toISOString(),
    }))
    out.push({ dia, meta, ads, pedidos, abandonos })
  }
  cache = { chave, dias: out }
  return out
}
const dentro = (iso: string | null, a: string, b: string) => !!iso && iso >= a && iso < b

export const pedidos = (a: string, b: string) => gerar().flatMap((d) => d.pedidos).filter((c) => dentro(c.pedido_em, a, b))
export const compras = (a: string, b: string) => gerar().flatMap((d) => d.pedidos).filter((c) => c.viva && dentro(c.aprovada_em, a, b))
export const reembolsos = (a: string, b: string) => gerar().flatMap((d) => d.pedidos).filter((c) => !c.viva && dentro(c.reembolsada_em, a, b))
export const abandonos = (a: string, b: string) => gerar().flatMap((d) => d.abandonos).filter((x) => dentro(x.recebido_em, a, b))
export const metaConjuntos = (a: string, b: string) => gerar().filter((d) => d.dia >= a && d.dia <= b).flatMap((d) => d.meta)
export const metaAnuncios = (a: string, b: string) => gerar().filter((d) => d.dia >= a && d.dia <= b).flatMap((d) => d.ads)

export function gastos(): Gasto[] {
  const m0 = dias()[0].slice(0, 7)
  return [
    { mes: m0, grupo: 'Equipe', descricao: 'Gestor de tráfego', tipo: 'fixo', valor: 2500, recorrente: true },
    { mes: m0, grupo: 'Equipe', descricao: 'Editor de vídeo', tipo: 'fixo', valor: 1200, recorrente: true },
    { mes: m0, grupo: 'Ferramentas', descricao: 'Hospedagem e ferramentas', tipo: 'fixo', valor: 350, recorrente: true },
    { mes: m0, grupo: 'Impostos', descricao: 'Simples Nacional', tipo: '%', valor: 6, recorrente: true },
    { mes: m0, grupo: 'Comissões', descricao: 'Comissão da vendedora', tipo: '%', valor: 3, recorrente: true },
  ]
}
export const config = (): Record<string, string> => ({ meta_lucro: '8000', imposto_meta_pct: '12,5', taxa_gateway_pct: '10', ticket: String(ticket()), funil3x: '4 / 23 / 45' })

export function comportamento(a: string, b: string, prefixo: string): Visita[] {
  const s = site()
  if (s.prefixo !== prefixo) return []
  const nb = s.blocos.length || 12
  const ofertas = s.blocosOferta.length ? s.blocosOferta : [Math.round(nb * 0.7), nb - 2]
  const out: Visita[] = []
  const lpDia = new Map(gerar().map((d) => [d.dia, d.meta.reduce((x, m) => x + m.lp_views, 0)]))
  for (const dia of dias().slice(-21)) {
    const r = rng(`v-${dia}`)
    const base0 = Date.parse(`${dia}T03:00:00Z`)
    const nVis = Math.round((lpDia.get(dia) ?? 70) * 0.9) // ~90% das visitas que o Meta mandou chegam medidas
    for (let i = 0; i < nVis; i++) {
      const t = base0 + Math.floor(r() * DIA)
      if (t > Date.now()) continue
      const inicio = new Date(t).toISOString()
      if (inicio < a || inicio >= b) continue
      const fundo = r() < 0.38 ? 1 : Math.min(nb, 2 + Math.floor(r() * r() * nb * 1.3))
      const compra = fundo >= ofertas[0] && r() < 0.3
      const blocos: Visita['blocos'] = {}
      let ms = 0
      for (let k = 1; k <= fundo; k++) { const dur = Math.round((k === 1 ? 4000 : 2000) + r() * (k === ofertas[0] ? 14000 : 7000)); blocos[String(k).padStart(2, '0')] = { ms: dur, chegou_ms: ms, vezes: 1 }; ms += dur }
      const cliques: Visita['cliques'] = []
      if (fundo >= 2 && r() < 0.35) cliques.push({ ms: blocos['02'].chegou_ms + 1500, b: 2, o: 'carrossel: arrastou' })
      if (fundo >= nb - 1 && r() < 0.5) cliques.push({ ms: ms - 3000, b: nb - 1, o: ['pergunta: É mensalidade?', 'pergunta: Como funciona a garantia?', 'pergunta: Quando eu recebo?'][Math.floor(r() * 3)] })
      if (fundo >= 3 && r() < 0.08) cliques.push({ ms: blocos['03'].chegou_ms + 900, b: 3, o: 'toque fora de botão: foto do antes e depois' })
      let comprar_ms: number | null = null, comprar_local: string | null = null
      if (compra) { const bl = fundo >= ofertas[1] && r() < 0.4 ? ofertas[1] : ofertas[0]; comprar_ms = (blocos[String(bl).padStart(2, '0')]?.chegou_ms ?? ms) + 3000; comprar_local = bl === ofertas[0] ? 'oferta-1' : 'oferta-2'; cliques.push({ ms: comprar_ms, b: bl, o: `comprar: ${comprar_local}` }) }
      cliques.sort((x, y) => x.ms - y.ms)
      const c = CONJ[Math.floor(r() * CONJ.length)]
      out.push({
        id: `demo-${dia}-${i}`, vid: `v${i % 50}`, slug: s.paginas[i % s.paginas.length][0], inicio, utm_source: 'FB',
        utm_medium: ['Instagram_Reels', 'Instagram_Stories', 'Facebook_Mobile_Feed', 'Instagram_Feed'][Math.floor(r() * 4)], utm_campaign: c.campaign_name, utm_content: c.ads[0], utm_term: c.adset_id,
        aparelho: r() < 0.9 ? 'celular' : 'computador', carregou_ms: Math.round(1200 + r() * r() * 4500), total_ms: ms, ativo_ms: ms, rolagem_max: Math.round((fundo / nb) * 100),
        bloco_max: fundo, ultimo_bloco: fundo, blocos, cliques, comprar_ms, comprar_local,
      })
    }
  }
  return out.sort((x, y) => y.inicio.localeCompare(x.inicio))
}
export function fontes(): Fonte[] {
  const agora = new Date(Date.now() - 17 * 60_000).toISOString()
  return [
    { nome: 'meta', ultima_leitura: agora, ok: true, detalhe: 'DEMONSTRAÇÃO: dados fictícios', linhas: 12 },
    { nome: 'planilha', ultima_leitura: agora, ok: true, detalhe: 'DEMONSTRAÇÃO: dados fictícios', linhas: 5 },
  ]
}
export function ultimos() {
  const p = pedidos(new Date(Date.now() - DIA).toISOString(), new Date().toISOString())
  return { evento: p[0] ? { recebido_em: p[0].pedido_em, gateway: p[0].gateway, status: p[0].ultimo_status } : null, visita: { inicio: new Date(Date.now() - 4 * 60_000).toISOString(), slug: site().paginas[0][0] }, eventos30d: pedidos(new Date(Date.now() - 30 * DIA).toISOString(), new Date().toISOString()).length }
}
