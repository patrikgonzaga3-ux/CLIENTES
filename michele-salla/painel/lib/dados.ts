// Leituras do banco do cliente para o painel. Com DEMO=1 tudo vem de lib/demo.ts (dados fictícios).
import 'server-only'
import { CLIENTE } from '@/cliente.config'
import { ler } from './db'
import * as demo from './demo'
import type { Gasto } from './lucro'

const q = encodeURIComponent
export const emDemo = () => process.env.DEMO === '1'

export type Compra = {
  transacao: string; gateway: string; produto_id: string | null; produto_nome: string | null
  valor: number; liquido: number | null; aprovada_em: string | null; reembolsada_em: string | null; pedido_em: string
  ultimo_status: string; viva: boolean; teste: boolean
  src: string | null; sck: string | null; xcod: string | null; utm_content: string | null
  email: string | null; nome: string | null; telefone: string | null; metodo: string | null; renovacao: boolean
}
export type MetaDia = {
  id: string; date: string; nome: string | null; adset_id: string | null; adset_name: string | null; campaign_id: string | null; campaign_name: string | null
  spend: number; link_clicks: number; lp_views: number; ic: number; purchases: number; purchase_value: number; impressions: number
}
export type Abandono = { event_key: string; produto_nome: string | null; valor: number | null; nome: string | null; email: string | null; telefone: string | null; sck: string | null; quando: string | null; recebido_em: string }
export type Visita = {
  id: string; vid: string | null; slug: string; inicio: string; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null
  utm_content: string | null; utm_term: string | null; aparelho: string | null; carregou_ms: number | null; total_ms: number; ativo_ms: number; rolagem_max: number
  bloco_max: number; ultimo_bloco: number; blocos: Record<string, { ms: number; chegou_ms: number; vezes: number }>
  cliques: { ms: number; b: number; o: string }[]; comprar_ms: number | null; comprar_local: string | null
}
export type Fonte = { nome: string; ultima_leitura: string | null; ok: boolean | null; detalhe: string | null; linhas: number | null }

const COLS_COMPRA = 'transacao,gateway,produto_id,produto_nome,valor,liquido,aprovada_em,reembolsada_em,pedido_em,ultimo_status,viva,teste,src,sck,xcod,utm_content,email,nome,telefone,metodo,renovacao'
const filtroProduto = () => (CLIENTE.produtos.length ? `&produto_id=in.(${CLIENTE.produtos.map((p) => q(p.id)).join(',')})` : '')
const numC = (c: Compra): Compra => ({ ...c, valor: Number(c.valor) || 0, liquido: c.liquido == null ? null : Number(c.liquido) })

/** Vendas vivas (aprovadas e não devolvidas), sem teste, aprovadas no período. */
export async function compras(since: string, until: string): Promise<Compra[]> {
  if (emDemo()) return demo.compras(since, until)
  const r = await ler<Compra>('pl_compras', `select=${COLS_COMPRA}&aprovada_em=gte.${q(since)}&aprovada_em=lt.${q(until)}&viva=is.true&teste=is.false${filtroProduto()}&order=aprovada_em.asc`)
  return r.map(numC)
}
/** Vendas devolvidas (reembolso ou chargeback) no período, pela data da devolução. */
export async function reembolsos(since: string, until: string): Promise<Compra[]> {
  if (emDemo()) return demo.reembolsos(since, until)
  const r = await ler<Compra>('pl_compras', `select=${COLS_COMPRA}&reembolsada_em=gte.${q(since)}&reembolsada_em=lt.${q(until)}&teste=is.false${filtroProduto()}&order=reembolsada_em.asc`)
  return r.map(numC)
}
/** Todos os pedidos gerados no período (qualquer status), 1 por transação. */
export async function pedidos(since: string, until: string): Promise<Compra[]> {
  if (emDemo()) return demo.pedidos(since, until)
  const r = await ler<Compra>('pl_compras', `select=${COLS_COMPRA}&pedido_em=gte.${q(since)}&pedido_em=lt.${q(until)}&teste=is.false${filtroProduto()}&order=pedido_em.desc`)
  return r.map(numC)
}
export async function abandonos(since: string, until: string): Promise<Abandono[]> {
  if (emDemo()) return demo.abandonos(since, until)
  return ler<Abandono>('pl_abandonos', `select=event_key,produto_nome,valor,nome,email,telefone,sck,quando,recebido_em&recebido_em=gte.${q(since)}&recebido_em=lt.${q(until)}&order=recebido_em.desc`)
}
const numM = (r: Record<string, unknown>): MetaDia => ({
  ...(r as MetaDia), spend: Number(r.spend) || 0, link_clicks: Number(r.link_clicks) || 0, lp_views: Number(r.lp_views) || 0, ic: Number(r.ic) || 0,
  purchases: Number(r.purchases) || 0, purchase_value: Number(r.purchase_value) || 0, impressions: Number(r.impressions) || 0,
})
/** Gasto do Meta por conjunto e dia (id = adset_id). */
export async function metaConjuntos(diaIni: string, diaFim: string): Promise<MetaDia[]> {
  if (emDemo()) return demo.metaConjuntos(diaIni, diaFim)
  const r = await ler<Record<string, unknown>>('pl_meta_conjuntos', `select=*&date=gte.${diaIni}&date=lte.${diaFim}&order=date.asc`)
  return r.map((x) => numM({ ...x, id: x.adset_id, nome: x.adset_name }))
}
/** Gasto do Meta por anúncio e dia (id = ad_id). */
export async function metaAnuncios(diaIni: string, diaFim: string): Promise<MetaDia[]> {
  if (emDemo()) return demo.metaAnuncios(diaIni, diaFim)
  const r = await ler<Record<string, unknown>>('pl_meta_anuncios', `select=*&date=gte.${diaIni}&date=lte.${diaFim}&order=date.asc`)
  return r.map((x) => numM({ ...x, id: x.ad_id, nome: x.ad_name }))
}
export async function gastos(): Promise<Gasto[]> {
  if (emDemo()) return demo.gastos()
  const r = await ler<Gasto>('pl_gastos', 'select=mes,grupo,descricao,tipo,valor,recorrente&order=mes.asc')
  return r.map((g) => ({ ...g, valor: Number(g.valor) || 0 }))
}
export async function lerConfigPlanilha(): Promise<Record<string, string>> {
  if (emDemo()) return demo.config()
  const r = await ler<{ chave: string; valor: string }>('pl_config', 'select=chave,valor')
  return Object.fromEntries(r.map((x) => [x.chave, x.valor]))
}
export async function comportamento(since: string, until: string, prefixo: string): Promise<Visita[]> {
  if (emDemo()) return demo.comportamento(since, until, prefixo)
  const cols = 'id,vid,slug,inicio,utm_source,utm_medium,utm_campaign,utm_content,utm_term,aparelho,carregou_ms,total_ms,ativo_ms,rolagem_max,bloco_max,ultimo_bloco,blocos,cliques,comprar_ms,comprar_local'
  const r = await ler<Visita>('pl_comportamento', `select=${cols}&slug=like.${q(prefixo)}-*&inicio=gte.${q(since)}&inicio=lt.${q(until)}&order=inicio.desc`)
  return r.map((v) => ({ ...v, blocos: v.blocos && typeof v.blocos === 'object' ? v.blocos : {}, cliques: Array.isArray(v.cliques) ? v.cliques : [] }))
}
export async function fontes(): Promise<Fonte[]> {
  if (emDemo()) return demo.fontes()
  return ler<Fonte>('pl_fontes', 'select=*&order=nome.asc')
}
/** Último aviso do gateway e última visita medida (para a aba Fontes). */
export async function ultimos(): Promise<{ evento: { recebido_em: string; gateway: string; status: string } | null; visita: { inicio: string; slug: string } | null; eventos30d: number }> {
  if (emDemo()) return demo.ultimos()
  const [e, v, n] = await Promise.all([
    ler<{ recebido_em: string; gateway: string; status: string }>('pl_eventos', 'select=recebido_em,gateway,status&order=recebido_em.desc&limit=1'),
    ler<{ inicio: string; slug: string }>('pl_comportamento', 'select=inicio,slug&order=inicio.desc&limit=1'),
    ler<{ id: number }>('pl_eventos', `select=id&recebido_em=gte.${q(new Date(Date.now() - 30 * 86_400_000).toISOString())}`),
  ])
  return { evento: e[0] ?? null, visita: v[0] ?? null, eventos30d: n.length }
}
