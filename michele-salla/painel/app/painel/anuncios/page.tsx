// ABA ANÚNCIOS · FUNIL 3X: quanto custa o clique, o initiate checkout e a compra, contra as metas sobre o ticket
// (padrão 4%, 23% e 45%), no total e por campanha, conjunto e anúncio. Venda = gateway (pelo id do conjunto que o
// link leva no utm_term, e pelo nome do anúncio no utm_content).
import { CLIENTE } from '@/cliente.config'
import { cfgEfetiva } from '@/lib/config'
import { comportamento, compras as lerCompras, metaAnuncios, metaConjuntos, type MetaDia } from '@/lib/dados'
import { funil3x } from '@/lib/lucro'
import { porta, Shell } from '../_shell'
import { brl, brl0, int, num2, pct } from '../_ui/fmt'
import { FiltroPeriodo, periodo, type SP } from '../_ui/periodo'
import { Caixa, Grade, ParaDecidir, Secao, Tabela, Tile, Titulo, Vazio, td, tdL, th, thL, type Decisao } from '../_ui/ui'

export const dynamic = 'force-dynamic'
const FONTES = ['FB', 'FACEBOOK', 'IG', 'INSTAGRAM', 'META']
const decUtm = (v: string | null | undefined) => { const t = String(v || '').replace(/\+/g, ' '); try { return decodeURIComponent(t) } catch { return t } }

type Linha = { k: string; nome: string; sub?: string; g: number; cl: number; ic: number; icPag: number; px: number; v: number; fat: number }
const pctN = (f: number) => `${(Math.round(f * 1000) / 10).toLocaleString('pt-BR')}%`
const nova = (k: string, nome: string, sub?: string): Linha => ({ k, nome, sub, g: 0, cl: 0, ic: 0, icPag: 0, px: 0, v: 0, fat: 0 })

export default async function Anuncios({ searchParams }: { searchParams: Promise<SP> }) {
  const b = await porta(); if (b) return b
  const sp = await searchParams
  const per = periodo(sp, '7d')
  const [cfg, conj, ads, cs, vis] = await Promise.all([
    cfgEfetiva(), metaConjuntos(per.diaIni, per.diaFim), metaAnuncios(per.diaIni, per.diaFim), lerCompras(per.since, per.until),
    Promise.all(CLIENTE.sites.map((s) => comportamento(per.since, per.until, s.prefixo))).then((x) => x.flat()),
  ])
  const visAnuncio = vis.filter((v) => FONTES.includes((v.utm_source || '').toUpperCase()))
  const clicouComprar = visAnuncio.filter((v) => v.comprar_ms != null)
  const gasto = conj.reduce((s, x) => s + x.spend, 0)
  const cliques = conj.reduce((s, x) => s + x.link_clicks, 0)
  const lp = conj.reduce((s, x) => s + x.lp_views, 0)
  const icMeta = conj.reduce((s, x) => s + x.ic, 0)
  // Com o rastreio na página, o IC é o clique em comprar (1 por visita) — mas só quando a página mede pelo menos
  // metade das visitas que o Meta mandou; com cobertura menor (página sem a linha, bloqueador), fica o do pixel.
  const cobertura = (lp || cliques) > 0 ? visAnuncio.length / (lp || cliques) : 0
  const icDaPagina = visAnuncio.length > 0 && cobertura >= 0.5
  const ic = icDaPagina ? clicouComprar.length : icMeta
  const vendasAnuncio = cs.filter((c) => /^\d{6,}$/.test(c.src || ''))
  const f3 = funil3x(gasto, { cliques, ic, compras: vendasAnuncio.length }, cfg.ticket, cfg.funil3x)
  const fatAnuncio = vendasAnuncio.reduce((s, c) => s + c.valor, 0)

  // por conjunto e campanha
  const porConj = new Map<string, Linha>(), porCamp = new Map<string, Linha>(), campDoConj = new Map<string, string>()
  const soma = (m: Map<string, Linha>, k: string, nome: string, x: MetaDia, sub?: string) => {
    const l = m.get(k) ?? nova(k, nome, sub); l.g += x.spend; l.cl += x.link_clicks; l.ic += x.ic; l.px += x.purchases; if (nome && !l.nome) l.nome = nome; m.set(k, l)
  }
  for (const x of conj) { soma(porConj, x.id, x.adset_name || x.id, x, x.campaign_name || undefined); if (x.campaign_id) { soma(porCamp, x.campaign_id, x.campaign_name || x.campaign_id, x); campDoConj.set(x.id, x.campaign_id) } }
  for (const c of vendasAnuncio) {
    const l = porConj.get(c.src as string) ?? nova(c.src as string, `conjunto ${c.src}`); l.v++; l.fat += c.valor; porConj.set(l.k, l)
    const camp = campDoConj.get(c.src as string)
    if (camp) { const lc = porCamp.get(camp)!; lc.v++; lc.fat += c.valor }
  }
  for (const v of clicouComprar) {
    if (v.utm_term && porConj.has(v.utm_term)) porConj.get(v.utm_term)!.icPag++
    const camp = v.utm_term ? campDoConj.get(v.utm_term) : undefined
    if (camp) porCamp.get(camp)!.icPag++
  }
  // por anúncio (venda pelo nome do anúncio no utm_content)
  const porAd = new Map<string, Linha>()
  for (const x of ads) soma(porAd, x.id, x.nome || x.id, x, x.adset_name || undefined)
  const nomeAd = new Map([...porAd.values()].map((l) => [l.nome.trim().toLowerCase(), l]))
  for (const c of vendasAnuncio) { const l = c.utm_content ? nomeAd.get(decUtm(c.utm_content).trim().toLowerCase()) : undefined; if (l) { l.v++; l.fat += c.valor } }
  for (const v of clicouComprar) { const l = v.utm_content ? nomeAd.get(decUtm(v.utm_content).trim().toLowerCase()) : undefined; if (l) l.icPag++ }

  const META = { clique: cfg.ticket * cfg.funil3x.clique, ic: cfg.ticket * cfg.funil3x.ic, compra: cfg.ticket * cfg.funil3x.compra }
  const cor = (v: number | null, m: number) => (v == null ? undefined : v <= m ? 'var(--g)' : v <= m * 1.3 ? 'var(--pn-amar)' : 'var(--pn-verm)')
  const custo = (g: number, n: number) => (n > 0 && g > 0 ? g / n : null)
  const C = ({ v, m }: { v: number | null; m: number }) => <span style={{ fontWeight: 700, color: cor(v, m) }}>{v == null ? '—' : brl(v)}</span>

  const decisoes: Decisao[] = []
  if (!gasto) decisoes.push({ tipo: 'n', txt: 'Sem gasto do Meta no período. Se a conta já tem campanha rodando, confira a aba Fontes de dados.' })
  const pior = f3.filter((e) => e.status === 'ruim')[0]
  if (pior) decisoes.push({ tipo: 'no', txt: `${pior.nome} acima da meta: ${brl(pior.custo ?? 0)} contra ${brl(pior.meta)}. ${pior.etapa === 'clique' ? 'Problema no criativo ou no público (o anúncio não chama o clique).' : pior.etapa === 'ic' ? 'Clique ok e pouca gente clica em comprar: o problema está na página (ver Comportamento na página).' : 'Muita gente chega no checkout e pouca compra: checkout, forma de pagamento ou preço (ver Recuperar vendas).'}` })
  else if (gasto && f3.every((e) => e.status === 'ok')) decisoes.push({ tipo: 'ok', txt: 'As 3 etapas do funil estão dentro da meta: dá para testar mais verba nos melhores conjuntos (subir 20% a cada 2 ou 3 dias).' })
  const melhores = [...porConj.values()].filter((l) => l.v >= 2).sort((x, y) => (custo(x.g, x.v) ?? 1e9) - (custo(y.g, y.v) ?? 1e9))
  if (melhores[0]) decisoes.push({ tipo: 'ok', txt: `Conjunto com menor custo por venda: ${melhores[0].nome} (${brl(custo(melhores[0].g, melhores[0].v) ?? 0)} por venda, ${int(melhores[0].v)} vendas).` })
  const queimando = [...porConj.values()].filter((l) => l.v === 0 && l.g >= META.compra * 2).sort((x, y) => y.g - x.g)
  if (queimando[0]) decisoes.push({ tipo: 'wait', txt: `${int(queimando.length)} conjunto(s) gastaram mais que 2 vendas na meta sem nenhuma venda (ex.: ${queimando[0].nome}, ${brl0(queimando[0].g)}). Avaliar pausar.` })

  const tabela = (titulo: string, sub: string, linhas: Linha[], col: string, mostraVenda: boolean, compraPixel: boolean) => (
    <Secao titulo={titulo} sub={sub}>
      {linhas.length ? (
        <Tabela min={980}>
          <thead><tr><th style={thL}>{col}</th><th style={th}>Gasto</th><th style={th}>Cliques</th><th style={th}>Custo/clique</th><th style={th}>IC</th><th style={th}>Custo/IC</th><th style={th}>Vendas</th><th style={th}>Custo/venda</th><th style={th}>Faturamento</th><th style={th}>ROAS</th>{compraPixel && <th style={th}>Compras (pixel)</th>}</tr></thead>
          <tbody>{linhas.map((l) => { const icL = icDaPagina ? l.icPag : l.ic; return (
            <tr key={l.k}><td style={tdL}>{l.nome}{l.sub && <div style={{ color: 'var(--mute)', fontSize: 11.5 }}>{l.sub}</div>}</td><td style={td}>{brl(l.g)}</td><td style={td}>{int(l.cl)}</td><td style={td}><C v={custo(l.g, l.cl)} m={META.clique} /></td><td style={td}>{int(icL)}</td><td style={td}><C v={custo(l.g, icL)} m={META.ic} /></td>
              <td style={{ ...td, fontWeight: 700 }}>{mostraVenda ? int(l.v) : '—'}</td><td style={td}>{mostraVenda ? <C v={custo(l.g, l.v)} m={META.compra} /> : '—'}</td><td style={td}>{mostraVenda ? brl0(l.fat) : '—'}</td><td style={td}>{mostraVenda && l.g ? `${num2(l.fat / l.g)}×` : '—'}</td>{compraPixel && <td style={td}>{int(l.px)}</td>}</tr>
          ) })}</tbody>
        </Tabela>
      ) : <Vazio>Sem dados no período.</Vazio>}
    </Secao>
  )

  return (
    <Shell active="anuncios">
      <Titulo titulo="Anúncios · funil 3x" sub={`Quanto custa cada etapa contra a meta sobre o ticket de ${brl0(cfg.ticket)}: clique até ${pctN(cfg.funil3x.clique)} (${brl(META.clique)}), initiate checkout até ${pctN(cfg.funil3x.ic)} (${brl(META.ic)}) e compra até ${pctN(cfg.funil3x.compra)} (${brl(META.compra)}).`} />
      <FiltroPeriodo per={per} presets={[['hoje', 'Hoje'], ['ontem', 'Ontem'], ['7d', '7 dias'], ['mes', 'Mês atual'], ['30d', '30 dias']]} />
      <ParaDecidir itens={decisoes.slice(0, 5)} />
      <Grade min={200}>
        {f3.map((e) => <Tile key={e.etapa} label={`Custo por ${e.etapa === 'clique' ? 'clique' : e.etapa === 'ic' ? 'initiate checkout' : 'compra'}`} value={e.custo == null ? '—' : brl(e.custo)} cor={cor(e.custo, e.meta)} destaque={e.custo != null} sub={`meta ${brl(e.meta)} · ${int(e.qtd)} ${e.etapa === 'clique' ? 'cliques no link' : e.etapa === 'ic' ? (icDaPagina ? 'cliques em comprar na página' : 'initiate checkout (pixel)') : 'vendas do anúncio (gateway)'}`} />)}
        <Tile label="Gasto" value={brl0(gasto)} sub={`ROAS ${gasto ? num2(fatAnuncio / gasto) : '—'}× · ${cliques ? pct(lp, cliques, 0) : '—'} dos cliques abrem a página`} />
      </Grade>
      <div className="mt-3 mb-6"><Caixa tom="info">{icDaPagina ? `Initiate checkout = visitas do anúncio que clicaram em comprar na página (medido pelo rastreio, 1 por visita; a página mediu ${pct(visAnuncio.length, lp || cliques, 0)} das visitas que o Meta mandou). O pixel do Meta registrou ${int(icMeta)}: ele conta também a abertura do checkout do gateway.` : visAnuncio.length ? `Initiate checkout pelo pixel do Meta: o rastreio da página mediu só ${pct(visAnuncio.length, lp || cliques, 0)} das visitas que o Meta mandou (falta a linha em alguma página?). Acima de 50%, o painel passa a usar o clique em comprar medido na página.` : 'Initiate checkout pelo pixel do Meta. Com o rastreio na página de vendas, passa a contar o clique em comprar medido na página (1 por visita).'} Venda do anúncio = venda do gateway com o id do conjunto no link (utm_term).</Caixa></div>
      {tabela('Por campanha', 'Somando os conjuntos de cada campanha.', [...porCamp.values()].sort((x, y) => y.g - x.g), 'Campanha', true, true)}
      {tabela('Por conjunto', 'Venda pelo id do conjunto que o link do anúncio leva (utm_term).', [...porConj.values()].sort((x, y) => y.g - x.g || y.v - x.v), 'Conjunto', true, true)}
      {tabela('Por anúncio', 'Venda pelo nome do anúncio que o link leva (utm_content); compras do pixel ao lado, para comparar.', [...porAd.values()].sort((x, y) => y.g - x.g).slice(0, 40), 'Anúncio', true, true)}
      <Caixa tom="info">Parâmetros de URL para todo anúncio (o painel depende deles): <code>utm_source=FB&amp;utm_medium={'{{placement}}'}&amp;utm_campaign={'{{campaign.name}}'}&amp;utm_content={'{{ad.name}}'}&amp;utm_term={'{{adset.id}}'}</code></Caixa>
    </Shell>
  )
}
