// Painel "Comportamento na página" de um site do cliente (CLIENTE.sites, rastreio /rastreio.js).
// 23/10, Patrik: "quero saber o tempo de tela do cliente, em qual bloco ele ta parando… onde clica, quanto tempo demora
// pra clicar, quanto tempo ele fica em cada bloco" e "analise tudo, ve se faz sentido pra tomar boas decisoes do nosso
// produto". Lê pl_comportamento (1 linha por visita, gravada pelo public/rastreio.js).
//
// Ordem da tela = ordem da decisão: (1) onde está o gargalo (funil da página até a venda, com referência por etapa),
// (2) números da visita, (3) bloco a bloco, (4) dúvidas e toques fora de botão, (5) cliques e tempo até comprar,
// (6) por anúncio / página / aparelho, (7) visitas passo a passo.
import type { SiteCfg } from '@/cliente.config'
import { comportamento as comportamentoSite, type Visita as VisitaSite } from '@/lib/dados'
import { Shell as PainelShell } from '../_shell'
import { horaBR, int, pct } from './fmt'
import { FiltroPeriodo, type Periodo } from './periodo'
import { Abas, Barra, Caixa, Grade, ParaDecidir, Secao, Tabela, Tile, Titulo, Vazio, td, tdL, th, thL, type Decisao } from './ui'

export type BuscaComportamento = { p?: string; de?: string; ate?: string; orig?: string; pag?: string; ap?: string }

// Referência de cada etapa do funil da página (quantos passam da etapa anterior). Ponto de partida para achar o
// gargalo, não meta: as 2 do checkout vêm do histórico do quiz (cliques que viram pedido 21–29%; Pix pago 56%);
// as 3 da página são estimativas iniciais. Ajustar quando o site tiver ~500 visitas.
const REF = { topo: 0.6, oferta: 0.5, comprar: 0.25, pedido: 0.25, venda: 0.55 }
const MIN_VISITAS = 100 // abaixo disso, diferença entre blocos e anúncios pode ser sorte
const MIN_BASE_ETAPA = 20 // etapa só entra no gargalo com pelo menos 20 pessoas na etapa anterior

const k2 = (n: number) => String(n).padStart(2, '0')
const FONTES_ANUNCIO = ['FB', 'FACEBOOK', 'IG', 'INSTAGRAM', 'META']
const decUtm = (v: string | null | undefined) => { const t = String(v || '').replace(/\+/g, ' '); try { return decodeURIComponent(t) } catch { return t } }
type SiteComportamento = SiteCfg & { base: string }
const mediana = (xs: number[]) => {
  if (!xs.length) return null
  const o = [...xs].sort((a, b) => a - b), m = Math.floor(o.length / 2)
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2
}
const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
/** 83000 → "1 min 23 s" */
const tempo = (ms: number | null | undefined) => {
  if (ms == null) return '—'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s} s`
  const m = Math.floor(s / 60)
  return s % 60 ? `${m} min ${s % 60} s` : `${m} min`
}
const seg = (ms: number | null | undefined) => (ms == null ? '—' : `${(ms / 1000).toFixed(1).replace('.', ',')} s`)
/** relógio da linha do tempo: 83000 → "1:23" */
const relogio = (ms: number) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }
const doAnuncio = (v: VisitaSite) => FONTES_ANUNCIO.includes((v.utm_source || '').toUpperCase())
const clicou = (v: VisitaSite) => v.comprar_ms != null
const viu = (v: VisitaSite, n: number) => !!v.blocos[k2(n)]
/** Onde parou: o bloco do meio da tela na última leitura, para quem NÃO clicou em comprar. */
const parouEm = (v: VisitaSite) => (clicou(v) ? 0 : v.ultimo_bloco || v.bloco_max || 1) // saiu antes de medir o 1º bloco = topo

export async function PainelComportamento({ site, per, sp, checkout, visitasPadrao }: {
  site: SiteComportamento
  per: Periodo
  sp: BuscaComportamento
  /** slug da página de cada pedido e de cada venda da Greenn no período (o utm_source que o botão leva) */
  checkout: { pedidos: string[]; vendas: string[] }
  /** visitas do anúncio contadas pela visita padrão (3 s, 1 por dia), para conferir se o rastreio pega todo mundo */
  visitasPadrao: number
}) {
  const BASE = site.base
  let NB = site.blocos.length // sem nomes no cliente.config.ts: conta pelo bloco mais fundo visto
  const nomeBloco = (n: number) => (n >= 1 && n <= NB ? `${k2(n)} · ${site.blocos[n - 1] ?? `Bloco ${n}`}` : '—')
  const nomePagina = (slug: string) => site.paginas.find(([s]) => s === slug)?.[1] ?? slug
  const blocosOferta = site.blocosOferta.length ? site.blocosOferta : [] // sem blocos de oferta: "chegou na oferta" = clicou em algum botão de comprar ou passou de 70% da página
  const viuOferta = (v: VisitaSite) => (blocosOferta.length ? blocosOferta.some((b) => viu(v, b)) : v.comprar_ms != null || v.rolagem_max >= 70)

  const orig = sp.orig === 'todas' ? 'todas' : 'anuncio'
  const pag = site.paginas.some(([s]) => s === `${site.prefixo}-${sp.pag}`) ? String(sp.pag) : ''
  const ap = sp.ap === 'celular' || sp.ap === 'computador' ? sp.ap : ''

  const todas = await comportamentoSite(per.since, per.until, site.prefixo).catch(() => [] as VisitaSite[])
  if (!NB) NB = Math.max(1, ...todas.map((v) => v.bloco_max))
  const vs = todas.filter((v) => (orig === 'todas' || doAnuncio(v)) && (!pag || v.slug === `${site.prefixo}-${pag}`) && (!ap || v.aparelho === ap))
  const n = vs.length
  const compradoras = vs.filter(clicou)
  const naoClicou = vs.filter((v) => !clicou(v))
  const doAnuncioN = todas.filter(doAnuncio).length

  // ── 1. funil da página até a venda
  const passouTopo = vs.filter((v) => v.bloco_max >= 2).length
  const chegouOferta = vs.filter(viuOferta).length
  const pedidosN = checkout.pedidos.filter((s) => !pag || s === `${site.prefixo}-${pag}`).length
  const vendasN = checkout.vendas.filter((s) => !pag || s === `${site.prefixo}-${pag}`).length
  const etapas = [
    { k: 'topo', nome: 'Passam do topo', qtd: passouTopo, base: n, ref: REF.topo, onde: 'anúncio → topo',
      acao: 'Muita gente sai no topo: a promessa do anúncio não bate com o topo da página, o topo não prende nos primeiros segundos ou a página demora para abrir (ver carregamento). Comparar "Saem no topo" por anúncio.' },
    { k: 'oferta', nome: 'Chegam na oferta', qtd: chegouOferta, base: passouTopo, ref: REF.oferta, onde: 'meio da página',
      acao: 'Leem o começo mas não chegam no preço: ver em "Bloco a bloco" onde mais saem e encurtar ou trocar esse bloco; testar um botão de comprar mais cedo.' },
    { k: 'comprar', nome: 'Clicam em comprar', qtd: compradoras.length, base: chegouOferta, ref: REF.comprar, onde: 'oferta',
      acao: 'Chegam no preço e não clicam: oferta, preço, parcelamento, garantia ou prova. Ver as dúvidas que mais abrem no FAQ (são as objeções) e o tempo de quem clicou × quem não clicou na oferta.' },
    { k: 'pedido', nome: 'Viram pedido na Greenn', qtd: pedidosN, base: compradoras.length, ref: REF.pedido, onde: 'checkout', greenn: true,
      acao: 'Clicam em comprar e não geram pedido: o checkout da Greenn (campos, velocidade, forma de pagamento, preço diferente do da página). Testar o checkout no celular.' },
    { k: 'venda', nome: 'Viram venda', qtd: vendasN, base: pedidosN, ref: REF.venda, onde: 'pagamento', greenn: true,
      acao: 'Geram pedido e não pagam: Pix não pago e cartão recusado. Chamar no WhatsApp pela lista Recuperar da aba do site.' },
  ].map((e) => ({ ...e, taxa: e.base > 0 ? e.qtd / e.base : null }))
  const avaliaveis = etapas.filter((e) => e.base >= MIN_BASE_ETAPA && e.taxa != null && (!e.greenn || compradoras.length >= MIN_BASE_ETAPA))
  const gargalo = [...avaliaveis].sort((a, b) => (a.taxa as number) / a.ref - (b.taxa as number) / b.ref)[0]
  const temGargalo = gargalo && (gargalo.taxa as number) < gargalo.ref

  // ── 2. por bloco
  const linhas = Array.from({ length: NB }, (_, i) => {
    const nb = i + 1, k = k2(nb)
    const viram = vs.filter((v) => viu(v, nb))
    const ms = viram.map((v) => v.blocos[k].ms)
    return {
      nb, viram: viram.length, saiu: vs.filter((v) => parouEm(v) === nb).length, med: mediana(ms), med_media: media(ms),
      chega: mediana(viram.map((v) => v.blocos[k].chegou_ms)),
      medC: mediana(compradoras.filter((v) => viu(v, nb)).map((v) => v.blocos[k].ms)),
      medN: mediana(naoClicou.filter((v) => viu(v, nb)).map((v) => v.blocos[k].ms)),
      cliques: vs.reduce((a, v) => a + v.cliques.filter((c) => c.b === nb).length, 0),
    }
  })
  const maisSaida = [...linhas].sort((a, b) => b.saiu - a.saiu)[0]
  const maisTempo = [...linhas].sort((a, b) => (b.med ?? 0) - (a.med ?? 0))[0]

  // ── 3. cliques
  const alvos = new Map<string, { vis: number; total: number; blocos: Map<number, number>; primeiro: number[] }>()
  for (const v of vs) {
    const vistos = new Set<string>()
    for (const c of v.cliques) {
      const a = alvos.get(c.o) ?? { vis: 0, total: 0, blocos: new Map<number, number>(), primeiro: [] as number[] }
      a.total++
      a.blocos.set(c.b, (a.blocos.get(c.b) ?? 0) + 1)
      if (!vistos.has(c.o)) { vistos.add(c.o); a.vis++; a.primeiro.push(c.ms) }
      alvos.set(c.o, a)
    }
  }
  const blocoMais = (a: { blocos: Map<number, number> }) => [...a.blocos.entries()].sort((x, y) => y[1] - x[1])[0]?.[0] ?? 0
  const lista = [...alvos.entries()].sort((a, b) => b[1].vis - a[1].vis || b[1].total - a[1].total)
  const duvidas = lista.filter(([o]) => o.startsWith('pergunta: '))
  const toquesFora = lista.filter(([o]) => o.startsWith('toque fora de botão: '))
  const comFaq = vs.filter((v) => v.cliques.some((c) => c.o.startsWith('pergunta: ')))

  // ── 4. tempo até comprar
  const FAIXAS: [string, number, number][] = [['até 30 s', 0, 30e3], ['30 s a 1 min', 30e3, 60e3], ['1 a 2 min', 60e3, 120e3], ['2 a 5 min', 120e3, 300e3], ['mais de 5 min', 300e3, Infinity]]
  const tempos = compradoras.map((v) => v.comprar_ms as number)
  const locais = new Map<string, number[]>()
  for (const v of compradoras) { const l = v.comprar_local || '?'; locais.set(l, [...(locais.get(l) ?? []), v.comprar_ms as number]) }

  // ── 5. carregamento
  const cargas = vs.map((v) => v.carregou_ms).filter((x): x is number => x != null && x > 0)
  const lentas = cargas.filter((x) => x > 3000).length
  const cargaSaiuTopo = mediana(vs.filter((v) => v.bloco_max <= 1 && v.carregou_ms).map((v) => v.carregou_ms as number))
  const cargaPassou = mediana(vs.filter((v) => v.bloco_max >= 2 && v.carregou_ms).map((v) => v.carregou_ms as number))

  // ── 6. grupos
  const grupo = (chave: (v: VisitaSite) => string) => {
    const m = new Map<string, VisitaSite[]>()
    for (const v of vs) { const k = chave(v); m.set(k, [...(m.get(k) ?? []), v]) }
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length).map(([k, l]) => ({
      k, n: l.length, topo: l.filter((v) => v.bloco_max <= 1).length, tempo: mediana(l.map((v) => v.ativo_ms)), rol: mediana(l.map((v) => v.rolagem_max)),
      oferta: l.filter(viuOferta).length, comprar: l.filter(clicou).length, ate: mediana(l.filter(clicou).map((v) => v.comprar_ms as number)),
      carga: mediana(l.map((v) => v.carregou_ms).filter((x): x is number => x != null && x > 0)),
    }))
  }
  const porAnuncio = grupo((v) => (v.utm_content ? decUtm(v.utm_content) : doAnuncio(v) ? 'anúncio sem nome' : 'sem anúncio (link direto)')).slice(0, 25)
  const porPagina = grupo((v) => nomePagina(v.slug))
  const porAparelho = grupo((v) => v.aparelho || '?')
  const porPosicao = grupo((v) => v.utm_medium || 'sem posicionamento').slice(0, 12)
  const ultimas = vs.slice(0, 30)
  const soTopo = n - passouTopo

  // ── Para decidir
  const decisoes: Decisao[] = []
  if (!todas.length) decisoes.push({ tipo: 'n', txt: `Ainda sem visitas medidas no período. O rastreio começa quando a página de ${site.nome} tiver a linha do /rastreio.js (aba Fontes de dados mostra a linha pronta).` })
  if (n > 0 && n < MIN_VISITAS) decisoes.push({ tipo: 'wait', txt: `Amostra pequena: ${int(n)} visitas. Com menos de ${MIN_VISITAS} visitas (e de 30 cliques em comprar) a diferença entre blocos, anúncios e páginas pode ser sorte; olhe a tendência, sem trocar nada ainda.` })
  if (temGargalo && gargalo) decisoes.push({ tipo: 'no', txt: `Gargalo agora: ${gargalo.onde} (${gargalo.nome.toLowerCase()}: ${pct(gargalo.qtd, gargalo.base, 0)}, referência ${Math.round(gargalo.ref * 100)}%). ${gargalo.acao}` })
  else if (gargalo) decisoes.push({ tipo: 'ok', txt: 'Todas as etapas com volume estão na referência ou acima. O próximo ganho vem de mais tráfego bom (criativo) ou de testar a oferta.' })
  if (n >= 30 && maisSaida.saiu) decisoes.push({ tipo: 'wait', txt: `Bloco onde mais gente para: ${nomeBloco(maisSaida.nb)} (${pct(maisSaida.saiu, n, 0)} das visitas saem ali sem clicar em comprar).` })
  if (cargas.length >= 20 && lentas / cargas.length > 0.25) decisoes.push({ tipo: 'no', txt: `${pct(lentas, cargas.length, 0)} das visitas esperaram mais de 3 s para a página carregar (mediana ${seg(mediana(cargas))}). Página lenta derruba gente no topo: comprimir as fotos do topo e tirar o que não é usado.` })
  if (duvidas.length && comFaq.length >= 10) decisoes.push({ tipo: 'n', txt: `Dúvida que mais abrem: "${duvidas[0][0].slice(10)}" (${pct(duvidas[0][1].vis, n, 1)} das visitas). Responder isso antes do preço (no texto ou na oferta) costuma ajudar.` })
  if (toquesFora.length && toquesFora[0][1].vis >= 5) decisoes.push({ tipo: 'n', txt: `Muita gente toca em "${toquesFora[0][0].slice(21)}", que não é botão: virar link para a oferta ou deixar de parecer clicável.` })
  if (doAnuncioN > 0 && visitasPadrao > 0 && doAnuncioN < visitasPadrao * 0.7) decisoes.push({ tipo: 'wait', txt: `Conferência: o rastreio mediu ${int(doAnuncioN)} visitas do anúncio e a contagem padrão viu ${int(visitasPadrao)}. Alguma página pode estar sem o script (reimportar o modelo).` })

  const extra = { orig: orig === 'todas' ? 'todas' : undefined, pag: pag || undefined, ap: ap || undefined }
  const link = (mud: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries({ p: per.chave, de: per.chave === 'datas' ? per.diaIni : undefined, ate: per.chave === 'datas' ? per.diaFim : undefined, ...extra, ...mud })) if (v) p.set(k, v)
    return `${BASE}?${p.toString()}`
  }
  const corEtapa = (t: number | null, ref: number) => (t == null ? undefined : t >= ref ? 'var(--g)' : t >= ref * 0.75 ? 'var(--pn-amar)' : 'var(--pn-verm)')

  return (
    <PainelShell active="pagina">
      <Titulo titulo="Comportamento na página" sub={`${site.nome}: onde a pessoa para, quanto tempo fica em cada bloco, onde clica e quanto tempo leva até comprar. Uma linha por abertura da página.`} />
      <FiltroPeriodo per={per} base={BASE} extra={extra} presets={[['hoje', 'Hoje'], ['ontem', 'Ontem'], ['7d', '7 dias'], ['30d', '30 dias'], ['mes', 'Mês atual']]} />
      <Abas ativo={orig} itens={[['anuncio', 'Só do anúncio', link({ orig: undefined })], ['todas', 'Todas as visitas', link({ orig: 'todas' })]]} />
      {site.paginas.length > 1 && <Abas ativo={pag || 'tudo'} itens={[['tudo', 'Todas as páginas', link({ pag: undefined })], ...site.paginas.map(([s, r]) => [s.slice(site.prefixo.length + 1), r.split(' · ')[0] === r ? r : `Só a ${r.split(' · ')[0]}`, link({ pag: s.slice(site.prefixo.length + 1) })] as [string, string, string])]} />}
      <Abas ativo={ap || 'tudo'} itens={[['tudo', 'Celular e computador', link({ ap: undefined })], ['celular', 'Só celular', link({ ap: 'celular' })], ['computador', 'Só computador', link({ ap: 'computador' })]]} />
      <ParaDecidir itens={decisoes.slice(0, 6)} />

      <Secao titulo="Onde está o gargalo" sub="Da visita até a venda, etapa por etapa: quantos passam da etapa anterior e a referência de cada uma. A etapa mais abaixo da referência é onde mexer primeiro. As 2 últimas vêm da Greenn (pedido e venda pelo utm_source da página) e não seguem os filtros de anúncio e aparelho.">
        {n ? (
          <div className="rounded-2xl" style={{ background: 'var(--pn-card)', border: '1px solid rgb(var(--pn-rgb) / .07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', fontSize: 13.5 }}><strong>Visitas</strong><strong>{int(n)}</strong></div>
            {etapas.map((e) => {
              const g = temGargalo && gargalo?.k === e.k
              const cor = e.base < MIN_BASE_ETAPA ? 'var(--mute)' : corEtapa(e.taxa, e.ref) // pouca gente: sem cor de alarme
              return (
                <div key={e.k} style={{ padding: '11px 14px', borderTop: '1px solid rgb(var(--pn-rgb) / .06)', background: g ? 'rgb(220 60 60 / .07)' : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5, alignItems: 'baseline' }}>
                    <span><strong>{e.nome}</strong>{g && <span style={{ color: 'var(--pn-verm)', fontSize: 12, fontWeight: 800 }}> · gargalo ({e.onde})</span>}</span>
                    <span style={{ whiteSpace: 'nowrap' }}><strong style={{ color: cor, fontSize: 15 }}>{e.taxa == null ? '—' : pct(e.qtd, e.base, 0)}</strong> <span style={{ color: 'var(--mute)', fontSize: 12 }}>ref. {Math.round(e.ref * 100)}%</span></span>
                  </div>
                  <div style={{ margin: '6px 0 4px' }}><Barra valor={e.taxa ?? 0} marca={e.ref} cor={cor} altura={9} /></div>
                  <div style={{ fontSize: 12, color: 'var(--mute)' }}>{int(e.qtd)} de {int(e.base)} da etapa anterior · {pct(e.qtd, n, 1)} das visitas{e.base < MIN_BASE_ETAPA ? ' · pouca gente para julgar' : ''}</div>
                </div>
              )
            })}
          </div>
        ) : <Vazio>Sem visitas medidas no período com esses filtros.</Vazio>}
        {temGargalo && gargalo && <div className="mt-3"><Caixa tom="alerta"><strong>O que fazer no gargalo ({gargalo.onde}):</strong> {gargalo.acao}</Caixa></div>}
        <div className="mt-3"><Caixa tom="info">A referência é um ponto de partida (as do checkout vêm do histórico do quiz; as da página são estimativas) e será ajustada quando o site tiver umas 500 visitas. A linha preta na barra marca a referência. Verde: na referência ou acima; amarelo: até 25% abaixo; vermelho: mais que isso.</Caixa></div>
      </Secao>

      <Grade min={160}>
        <Tile label="Visitas medidas" value={int(n)} sub={`${int(new Set(vs.map((v) => v.vid || v.id)).size)} pessoas (navegadores)`} />
        <Tile label="Tempo na página" value={tempo(mediana(vs.map((v) => v.ativo_ms)))} sub={`mediana · média ${tempo(media(vs.map((v) => v.ativo_ms)))}`} />
        <Tile label="Saem no topo" value={n ? pct(soTopo, n, 0) : '—'} sub={`${int(soTopo)} não passaram do bloco 01`} cor={n && soTopo / n > 1 - REF.topo ? 'var(--pn-verm)' : undefined} />
        <Tile label="Chegam numa oferta" value={n ? pct(chegouOferta, n, 0) : '—'} sub={blocosOferta.length ? `viram o bloco ${blocosOferta.join(' ou o ')}` : 'clicaram em comprar ou rolaram 70% da página'} />
        <Tile label="Clicam em comprar" value={n ? pct(compradoras.length, n, 1) : '—'} sub={`${int(compradoras.length)} visitas`} cor="var(--g)" destaque={compradoras.length > 0} />
        <Tile label="Até clicar em comprar" value={tempo(mediana(tempos))} sub={`mediana · mais rápido ${tempo(tempos.length ? Math.min(...tempos) : null)}`} />
        <Tile label="Carregamento" value={seg(mediana(cargas))} sub={cargas.length ? `mediana · ${pct(lentas, cargas.length, 0)} acima de 3 s` : 'sem medida ainda'} cor={cargas.length && lentas / cargas.length > 0.25 ? 'var(--pn-verm)' : undefined} />
        <Tile label="Rolagem" value={`${int(mediana(vs.map((v) => v.rolagem_max)) ?? 0)}%`} sub="mediana de até onde rolam" />
      </Grade>
      {cargaSaiuTopo != null && cargaPassou != null && <p style={{ fontSize: 12.5, color: 'var(--sub)', margin: '-6px 0 18px' }}>Carregamento de quem saiu no topo: <strong style={{ color: 'var(--ink)' }}>{seg(cargaSaiuTopo)}</strong> · de quem passou do topo: <strong style={{ color: 'var(--ink)' }}>{seg(cargaPassou)}</strong>. Se o primeiro for bem maior, a lentidão está custando visitas.</p>}

      <Secao titulo="Bloco a bloco" sub="Viram = o bloco passou pelo meio da tela. Saíram aqui = o último bloco na tela de quem saiu sem clicar em comprar. Tempo = com o bloco no meio da tela e a aba aberta (mediana de quem viu). Se quem clica em comprar fica bem mais tempo num bloco do que quem não clica, esse bloco convence; se todos passam rápido, ele pode sair ou encurtar.">
        {n ? (
          <Tabela min={980}>
            <thead><tr><th style={thL}>Bloco</th><th style={th}>Saíram aqui</th><th style={th}>Tempo no bloco</th><th style={thL}>Viram</th><th style={th}>Média</th><th style={th}>Quem clicou comprar</th><th style={th}>Quem não clicou</th><th style={th}>Chegam em</th><th style={th}>Cliques</th></tr></thead>
            <tbody>{linhas.map((l) => (
              <tr key={l.nb} style={l.nb === maisSaida.nb && l.saiu ? { background: 'rgb(220 60 60 / .06)' } : undefined}>
                <td style={tdL}><strong>{nomeBloco(l.nb)}</strong></td>
                <td style={{ ...td, fontWeight: l.saiu ? 700 : 400, color: l.nb === maisSaida.nb && l.saiu ? 'var(--pn-verm)' : undefined }}>{l.saiu ? `${pct(l.saiu, n, 0)} · ${int(l.saiu)}` : '—'}</td>
                <td style={{ ...td, fontWeight: 700 }}>{tempo(l.med)}</td>
                <td style={{ ...tdL, minWidth: 150 }}><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><div style={{ flex: 1 }}><Barra valor={l.viram / n} /></div><span style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>{pct(l.viram, n, 0)}</span></div></td>
                <td style={td}>{tempo(l.med_media)}</td>
                <td style={td}>{tempo(l.medC)}</td>
                <td style={td}>{tempo(l.medN)}</td>
                <td style={td}>{l.chega == null ? '—' : relogio(l.chega)}</td>
                <td style={td}>{l.cliques ? int(l.cliques) : '—'}</td>
              </tr>
            ))}</tbody>
          </Tabela>
        ) : <Vazio>Sem visitas medidas no período com esses filtros.</Vazio>}
        {n > 0 && maisTempo.med != null && <p style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 8 }}>Bloco que mais prende: <strong style={{ color: 'var(--ink)' }}>{nomeBloco(maisTempo.nb)}</strong> ({tempo(maisTempo.med)}).</p>}
      </Secao>

      <Grade min={340}>
        <Secao titulo="Dúvidas que abrem (FAQ)" sub={`As perguntas abertas são as objeções de quem está decidindo. ${comFaq.length ? `${pct(comFaq.length, n, 0)} das visitas abriram pelo menos 1.` : ''}`}>
          {duvidas.length ? (
            <Tabela min={320}>
              <thead><tr><th style={thL}>Pergunta</th><th style={th}>Visitas</th><th style={th}>%</th></tr></thead>
              <tbody>{duvidas.slice(0, 15).map(([o, a]) => <tr key={o}><td style={tdL}>{o.slice(10)}</td><td style={td}>{int(a.vis)}</td><td style={td}>{pct(a.vis, n, 1)}</td></tr>)}</tbody>
            </Tabela>
          ) : <Vazio>Ninguém abriu o FAQ no período.</Vazio>}
        </Secao>
        <Secao titulo="Toques fora de botão" sub="Toques em texto ou foto que não fazem nada: a pessoa achou que era botão ou quis ver mais.">
          {toquesFora.length ? (
            <Tabela min={320}>
              <thead><tr><th style={thL}>Onde tocaram</th><th style={thL}>Bloco</th><th style={th}>Visitas</th></tr></thead>
              <tbody>{toquesFora.slice(0, 15).map(([o, a]) => <tr key={o}><td style={tdL}>{o.slice(21) || '(sem texto)'}</td><td style={tdL}>{nomeBloco(blocoMais(a))}</td><td style={td}>{int(a.vis)}</td></tr>)}</tbody>
            </Tabela>
          ) : <Vazio>Nenhum toque fora de botão no período.</Vazio>}
        </Secao>
      </Grade>

      <Secao titulo="Todos os cliques" sub="Cada botão, pergunta, foto ou toque. Visitas = quantas clicaram ali pelo menos 1 vez. 1º clique = segundos desde que abriu a página (mediana).">
        {lista.length ? (
          <Tabela min={760}>
            <thead><tr><th style={thL}>O que clicaram</th><th style={th}>Visitas</th><th style={th}>% das visitas</th><th style={th}>Cliques</th><th style={thL}>Bloco</th><th style={th}>1º clique em</th></tr></thead>
            <tbody>{lista.slice(0, 40).map(([o, a]) => <tr key={o}><td style={{ ...tdL, fontWeight: o.startsWith('comprar') ? 800 : 400 }}>{o}</td><td style={td}>{int(a.vis)}</td><td style={td}>{pct(a.vis, n, 1)}</td><td style={td}>{int(a.total)}</td><td style={tdL}>{nomeBloco(blocoMais(a))}</td><td style={td}>{tempo(mediana(a.primeiro))}</td></tr>)}</tbody>
          </Tabela>
        ) : <Vazio>Nenhum clique no período.</Vazio>}
      </Secao>

      <Secao titulo="Quanto tempo leva até clicar em comprar" sub="Só visitas que clicaram em comprar, da abertura da página até o 1º clique num botão da oferta. Muita gente comprando rápido = já veio decidida pelo anúncio; demorando muito = a página está fazendo o trabalho de convencer.">
        {compradoras.length ? (
          <Grade min={260}>
            <Tabela min={280}>
              <thead><tr><th style={thL}>Tempo</th><th style={th}>Visitas</th><th style={th}>%</th></tr></thead>
              <tbody>{FAIXAS.map(([r, a, z]) => { const q = tempos.filter((t) => t >= a && t < z).length; return <tr key={r}><td style={tdL}>{r}</td><td style={td}>{int(q)}</td><td style={td}>{pct(q, tempos.length, 0)}</td></tr> })}</tbody>
            </Tabela>
            <Tabela min={280}>
              <thead><tr><th style={thL}>Botão</th><th style={th}>Visitas</th><th style={th}>Mediana</th></tr></thead>
              <tbody>{[...locais.entries()].sort((a, b) => b[1].length - a[1].length).map(([l, t]) => <tr key={l}><td style={tdL}>{site.botoes[l] ?? l}</td><td style={td}>{int(t.length)}</td><td style={td}>{tempo(mediana(t))}</td></tr>)}</tbody>
            </Tabela>
          </Grade>
        ) : <Vazio>Ninguém clicou em comprar no período.</Vazio>}
      </Secao>

      {([['Por anúncio', 'O nome do anúncio vem do link do Meta (utm_content). "Saem no topo" alto = o anúncio promete algo que o topo não entrega; anúncio com mais cliques em comprar merece mais verba.', porAnuncio, 'Anúncio'],
        ['Por página', 'Mesmas medidas por versão da página.', porPagina, 'Página'],
        ['Por posicionamento', 'Reels, Stories, Feed… (utm_medium).', porPosicao, 'Posicionamento'],
        ['Por aparelho', 'Celular × computador.', porAparelho, 'Aparelho']] as const).map(([t, s, g, col]) => (
        <Secao key={t} titulo={t} sub={s}>
          {g.length ? (
            <Tabela min={860}>
              <thead><tr><th style={thL}>{col}</th><th style={th}>Visitas</th><th style={th}>Clicam comprar</th><th style={th}>Saem no topo</th><th style={th}>Chegam na oferta</th><th style={th}>Tempo</th><th style={th}>Até clicar</th><th style={th}>Rolagem</th><th style={th}>Carrega</th></tr></thead>
              <tbody>{g.map((x) => <tr key={x.k}><td style={tdL}>{x.k}</td><td style={td}>{int(x.n)}</td><td style={{ ...td, fontWeight: 700 }}>{x.comprar ? `${pct(x.comprar, x.n, 0)} · ${int(x.comprar)}` : '—'}</td><td style={{ ...td, color: x.n >= 10 && x.topo / x.n > 1 - REF.topo ? 'var(--pn-verm)' : undefined }}>{pct(x.topo, x.n, 0)}</td><td style={td}>{pct(x.oferta, x.n, 0)}</td><td style={td}>{tempo(x.tempo)}</td><td style={td}>{tempo(x.ate)}</td><td style={td}>{x.rol == null ? '—' : `${int(x.rol)}%`}</td><td style={td}>{seg(x.carga)}</td></tr>)}</tbody>
            </Tabela>
          ) : <Vazio>Sem visitas.</Vazio>}
        </Secao>
      ))}

      <Secao titulo="Últimas visitas, passo a passo" sub="As 30 mais recentes com esses filtros: de onde veio, quanto tempo ficou, até onde foi, onde parou e cada clique com o minuto em que aconteceu.">
        {ultimas.length ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {ultimas.map((v) => {
              const top = Object.entries(v.blocos).sort((a, b) => b[1].ms - a[1].ms).slice(0, 4)
              return (
                <div key={v.id} className="rounded-2xl p-3" style={{ background: 'var(--pn-card)', border: '1px solid rgb(var(--pn-rgb) / .08)', fontSize: 13, lineHeight: 1.55 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', color: 'var(--sub)' }}>
                    <strong style={{ color: 'var(--ink)' }}>{horaBR(v.inicio)}</strong>
                    <span>{nomePagina(v.slug)}</span>
                    <span>{v.aparelho || '?'}</span>
                    <span>{v.utm_content ? decUtm(v.utm_content) : doAnuncio(v) ? 'anúncio' : 'link direto'}{v.utm_medium ? ` · ${v.utm_medium}` : ''}</span>
                    <span>ficou <strong style={{ color: 'var(--ink)' }}>{tempo(v.ativo_ms)}</strong></span>
                    {v.carregou_ms != null && <span>carregou em {seg(v.carregou_ms)}</span>}
                    <span>rolou {int(v.rolagem_max)}%</span>
                    <span>foi até {nomeBloco(v.bloco_max)}</span>
                    {clicou(v) ? <span style={{ color: 'var(--g)', fontWeight: 800 }}>clicou em comprar em {tempo(v.comprar_ms)}</span> : <span style={{ color: 'var(--pn-verm)', fontWeight: 700 }}>parou em {nomeBloco(parouEm(v))}</span>}
                  </div>
                  {top.length > 0 && <div style={{ marginTop: 4 }}><span style={{ color: 'var(--mute)' }}>Mais tempo em: </span>{top.map(([k, b]) => `${site.blocos[Number(k) - 1] ?? k} ${tempo(b.ms)}`).join(' · ')}</div>}
                  <div style={{ marginTop: 4 }}>
                    <span style={{ color: 'var(--mute)' }}>Cliques: </span>
                    {v.cliques.length ? v.cliques.map((c, i) => <span key={i}>{i ? ' → ' : ''}<span style={{ color: 'var(--mute)' }}>{relogio(c.ms)}</span> <span style={{ fontWeight: c.o.startsWith('comprar') ? 800 : 400 }}>{c.o}</span></span>) : <span style={{ color: 'var(--mute)' }}>nenhum</span>}
                  </div>
                </div>
              )
            })}
          </div>
        ) : <Vazio>Sem visitas no período.</Vazio>}
        <div className="mt-3"><Caixa tom="info">Cada abertura da página é medida até a pessoa sair ou trocar de aba (envio a cada 10 s e ao sair). Não guarda nome, e-mail, telefone nem o que a pessoa digita. Prévia e robôs do Meta e navegadores automatizados ficam de fora. A visita ainda não é ligada à venda da Greenn uma a uma (o botão precisaria levar o id da visita no link do checkout, só com o OK do Patrik); pedido e venda entram no gargalo pelo total da página.</Caixa></div>
      </Secao>
    </PainelShell>
  )
}
