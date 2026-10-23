// ABA LUCRO: quanto sobrou no bolso no período e por quê (faturamento → taxas → anúncios → impostos → custos → lucro),
// projeção do mês contra a meta, ROAS de empate, dia a dia, por produto e mês a mês.
import { cfgEfetiva } from '@/lib/config'
import { compras as lerCompras, gastos as lerGastos, metaConjuntos, reembolsos as lerReembolsos, type Compra } from '@/lib/dados'
import { contaLucro, diasNoMes, gastosDoMes, partesDoPeriodo, projecaoMes, type ContaLucro } from '@/lib/lucro'
import { porta, Shell } from './_shell'
import { brl, brl0, int, num2, pct, pctv } from './_ui/fmt'
import { FiltroPeriodo, periodo, somaDias, type SP } from './_ui/periodo'
import { Barra, Caixa, Grade, ParaDecidir, Secao, Tabela, Tile, Titulo, Vazio, td, tdL, th, thL, type Decisao } from './_ui/ui'

export const dynamic = 'force-dynamic'
const DIA = 86_400_000
const diaSP = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
const corLucro = (v: number) => (v >= 0 ? 'var(--g)' : 'var(--pn-verm)')
const x2 = (v: number | null) => (v == null ? '—' : `${num2(v)}×`)

export default async function Lucro({ searchParams }: { searchParams: Promise<SP> }) {
  const b = await porta(); if (b) return b
  const sp = await searchParams
  const per = periodo(sp, 'mes')
  // 6 meses para o "mês a mês" (inclui o período escolhido quando ele é recente)
  const hojeMes = diaSP(new Date().toISOString()).slice(0, 7)
  const [a, m] = hojeMes.split('-').map(Number)
  const ini6 = new Date(Date.UTC(a, m - 6, 1)).toISOString().slice(0, 10)
  const since6 = `${ini6}T00:00:00-03:00`
  const desde = per.since < since6 ? per.since : since6
  const ate = new Date().toISOString() > per.until ? new Date().toISOString() : per.until
  const [cfg, todas, reemb, meta, gastos] = await Promise.all([
    cfgEfetiva(), lerCompras(desde, ate), lerReembolsos(per.since, per.until),
    metaConjuntos(desde.slice(0, 10) < per.diaIni ? desde.slice(0, 10) : per.diaIni, diaSP(ate) > per.diaFim ? diaSP(ate) : per.diaFim), lerGastos(),
  ])
  const noPer = (iso: string | null) => !!iso && iso >= per.since && iso < per.until
  const compras = todas.filter((c) => noPer(c.aprovada_em))
  const gastoMetaDe = (d0: string, d1: string) => meta.filter((x) => x.date >= d0 && x.date <= d1).reduce((s, x) => s + x.spend, 0)
  const cfgL = { impostoMetaPct: cfg.impostoMetaPct, taxaGatewayPct: cfg.taxaGatewayPct }
  const conta = contaLucro({ compras, gastoMeta: gastoMetaDe(per.diaIni, per.diaFim), gastos, partes: partesDoPeriodo(per.diaIni, per.diaFim), cfg: cfgL })

  // projeção (só no mês atual)
  const mesAtual = per.chave === 'mes'
  const dIni = Date.parse(`${per.diaIni}T03:00:00Z`)
  const diasCorridos = mesAtual ? (Date.now() - dIni) / DIA : 0
  const fixosMes = gastosDoMes(gastos, hojeMes).filter((g) => g.tipo === 'fixo').reduce((s, g) => s + g.valor, 0)
  const proj = mesAtual ? projecaoMes(conta.contribuicao, diasCorridos, diasNoMes(hojeMes), fixosMes) : null
  const metaLucro = cfg.metaLucroMes
  const reembValor = reemb.reduce((s, c) => s + c.valor, 0)

  // dia a dia
  const diasLista: string[] = []
  for (let d = per.diaIni; d <= per.diaFim && diasLista.length < 62; d = somaDias(d, 1)) diasLista.push(d)
  const porDia = diasLista.map((d) => {
    const cs = compras.filter((c) => diaSP(c.aprovada_em as string) === d)
    const ct = contaLucro({ compras: cs, gastoMeta: gastoMetaDe(d, d), gastos, partes: partesDoPeriodo(d, d), cfg: cfgL })
    return { d, ct }
  }).reverse()

  // por produto
  const prod = new Map<string, Compra[]>()
  for (const c of compras) { const k = c.produto_nome || c.produto_id || 'sem nome'; prod.set(k, [...(prod.get(k) ?? []), c]) }
  // por gateway (Greenn, Hotmart… separados)
  const NOME_GW: Record<string, string> = { greenn: 'Greenn', hotmart: 'Hotmart', kiwify: 'Kiwify' }
  const gw = new Map<string, Compra[]>()
  for (const c of compras) { const k = c.gateway || 'outro'; gw.set(k, [...(gw.get(k) ?? []), c]) }
  const porGateway = [...gw.entries()].map(([k, l]) => ({ k: NOME_GW[k] ?? k, n: l.length, bruto: l.reduce((s, c) => s + c.valor, 0), liq: l.reduce((s, c) => s + (c.liquido ?? c.valor * (1 - cfg.taxaGatewayPct / 100)), 0), reemb: reemb.filter((r) => r.gateway === k).length })).sort((x, y) => y.bruto - x.bruto)
  const porProduto = [...prod.entries()].map(([k, l]) => ({ k, n: l.length, bruto: l.reduce((s, c) => s + c.valor, 0), liq: l.reduce((s, c) => s + (c.liquido ?? c.valor * (1 - cfg.taxaGatewayPct / 100)), 0) })).sort((x, y) => y.bruto - x.bruto)

  // mês a mês (6 meses)
  const meses: { mes: string; ct: ContaLucro }[] = []
  for (let i = 5; i >= 0; i--) {
    const mes = new Date(Date.UTC(a, m - 1 - i, 1)).toISOString().slice(0, 7)
    const d0 = `${mes}-01`, d1 = mes === hojeMes ? diaSP(new Date().toISOString()) : `${mes}-${String(diasNoMes(mes)).padStart(2, '0')}`
    const cs = todas.filter((c) => c.aprovada_em && diaSP(c.aprovada_em) >= d0 && diaSP(c.aprovada_em) <= d1)
    meses.push({ mes, ct: contaLucro({ compras: cs, gastoMeta: gastoMetaDe(d0, d1), gastos, partes: partesDoPeriodo(d0, d1), cfg: cfgL }) })
  }

  const decisoes: Decisao[] = []
  if (!compras.length && !conta.anuncios) decisoes.push({ tipo: 'n', txt: 'Sem vendas nem gasto no período. Se o painel é novo, confira a aba Fontes de dados.' })
  if (conta.vendas || conta.anuncios) {
    if (conta.lucro < 0) decisoes.push({ tipo: 'no', txt: `O período está no prejuízo: ${brl0(conta.lucro)}. ${conta.contribuicao < 0 ? 'Mesmo antes dos custos fixos a conta não fecha: o anúncio custa mais do que as vendas deixam.' : 'As vendas pagam o anúncio, mas não os custos fixos.'}` })
    else decisoes.push({ tipo: 'ok', txt: `Lucro de ${brl0(conta.lucro)} no período (${pctv(conta.margem, 0)} do faturamento).` })
  }
  if (conta.roas != null && conta.roasEmpate != null) {
    if (conta.roas < conta.roasEmpate) decisoes.push({ tipo: 'no', txt: `Cada R$ 1 em anúncio volta R$ ${num2(conta.roas)} em vendas, abaixo do empate de R$ ${num2(conta.roasEmpate)} (já com taxas e impostos): aumentar a verba aumenta o prejuízo. Ver a aba Anúncios.` })
    else if (conta.roasEmpateComFixos != null && conta.roas < conta.roasEmpateComFixos) decisoes.push({ tipo: 'wait', txt: `O anúncio se paga (ROAS ${num2(conta.roas)} acima do empate de ${num2(conta.roasEmpate)}), mas ainda não cobre os custos fixos: para isso o ROAS precisa chegar a ${num2(conta.roasEmpateComFixos)} com esta verba.` })
  }
  if (proj != null && metaLucro > 0) decisoes.push({ tipo: proj >= metaLucro ? 'ok' : 'wait', txt: `No ritmo de hoje, o mês fecha com ${brl0(proj)} de lucro (meta ${brl0(metaLucro)}${proj < metaLucro ? `, faltam ${brl0(metaLucro - proj)}` : ''}).` })
  if (!gastos.length) decisoes.push({ tipo: 'wait', txt: 'Ainda não há gastos: o lucro está sem custos fixos e impostos sobre o faturamento. Inclua na aba Ajustes ou puxe da planilha.' })
  if (conta.liquidoEstimado) decisoes.push({ tipo: 'n', txt: `${int(conta.liquidoEstimado)} venda(s) sem o líquido do gateway: estimado com a taxa padrão de ${num2(cfg.taxaGatewayPct)}%.` })

  const linhaDRE = (nome: string, valor: number, opts: { forte?: boolean; sinal?: '−' | '=' | ''; sub?: string } = {}) => (
    <tr key={nome + valor}>
      <td style={{ ...tdL, fontWeight: opts.forte ? 800 : 400, paddingLeft: opts.sinal === '−' ? 22 : 10 }}>{opts.sinal ? `${opts.sinal} ` : ''}{nome}{opts.sub && <span style={{ color: 'var(--mute)', fontSize: 12 }}> · {opts.sub}</span>}</td>
      <td style={{ ...td, fontWeight: opts.forte ? 800 : 400, color: opts.forte && nome === 'Lucro' ? corLucro(valor) : undefined }}>{valor < 0 ? `−${brl(-valor)}` : brl(valor)}</td>
      <td style={{ ...td, color: 'var(--mute)' }}>{conta.bruto > 0 ? pct(Math.abs(valor), conta.bruto, 1) : '—'}</td>
    </tr>
  )

  return (
    <Shell active="lucro">
      <Titulo titulo="Lucro" sub="Quanto sobrou no bolso no período e por quê. Vendas pelo gateway, anúncios pelo Meta e custos pela aba Ajustes (ou pela planilha)." />
      <FiltroPeriodo per={per} presets={[['hoje', 'Hoje'], ['ontem', 'Ontem'], ['7d', '7 dias'], ['mes', 'Mês atual'], ['30d', '30 dias']]} />
      <ParaDecidir itens={decisoes.slice(0, 5)} />

      <Grade min={170}>
        <Tile label="Lucro" value={brl0(conta.lucro)} sub={`margem ${pctv(conta.margem, 1)}`} cor={corLucro(conta.lucro)} destaque />
        <Tile label="Faturamento" value={brl0(conta.bruto)} sub={`${int(conta.vendas)} vendas · líquido ${brl0(conta.liquido)}`} />
        <Tile label="Anúncios" value={brl0(conta.anuncios + conta.impostoMeta)} sub={`Meta ${brl0(conta.anuncios)} + imposto ${brl0(conta.impostoMeta)}`} />
        <Tile label="Custos" value={brl0(conta.variaveis + conta.fixos)} sub={`variáveis ${brl0(conta.variaveis)} · fixos ${brl0(conta.fixos)}`} />
        <Tile label="ROAS" value={x2(conta.roas)} sub={`empate ${x2(conta.roasEmpate)}${conta.roasEmpateComFixos ? ` · com fixos ${x2(conta.roasEmpateComFixos)}` : ''}`} cor={conta.roas != null && conta.roasEmpate != null ? (conta.roas >= conta.roasEmpate ? 'var(--g)' : 'var(--pn-verm)') : undefined} />
        <Tile label="Por venda" value={conta.custoVenda == null ? '—' : brl(conta.custoVenda)} sub={`custo de anúncio · lucro ${conta.lucroVenda == null ? '—' : brl(conta.lucroVenda)}`} />
        <Tile label="Devoluções" value={int(reemb.length)} sub={`${brl0(reembValor)} devolvidos no período`} cor={reemb.length ? 'var(--pn-amar)' : undefined} />
      </Grade>

      {mesAtual && (
        <Secao titulo="Meta do mês" sub={metaLucro > 0 ? `Lucro até agora contra a meta de ${brl0(metaLucro)}; a projeção leva o ritmo de hoje até o fim do mês, já com os custos fixos do mês inteiro.` : 'Sem meta de lucro: escreva a meta na aba Ajustes.'}>
          {metaLucro > 0 ? (
            <div className="rounded-2xl p-4" style={{ background: 'var(--pn-card)', border: '1px solid rgb(var(--pn-rgb) / .07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <span>Até agora <strong style={{ color: corLucro(conta.lucro) }}>{brl0(conta.lucro)}</strong></span>
                <span>Projeção <strong style={{ color: proj != null && proj >= metaLucro ? 'var(--g)' : 'var(--pn-amar)' }}>{proj == null ? '—' : brl0(proj)}</strong> · meta <strong>{brl0(metaLucro)}</strong></span>
              </div>
              <Barra valor={Math.max(0, conta.lucro) / metaLucro} marca={proj != null ? Math.max(0, proj) / metaLucro : undefined} />
              <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 6 }}>A barra é o lucro até agora; o traço é a projeção do mês.</div>
            </div>
          ) : <Vazio>Sem meta de lucro definida.</Vazio>}
        </Secao>
      )}

      <Secao titulo="A conta do lucro" sub="Do faturamento ao lucro, na ordem da planilha financeira. A coluna da direita é cada linha sobre o faturamento.">
        <Tabela min={460}>
          <thead><tr><th style={thL}>Linha</th><th style={th}>Valor</th><th style={th}>% do faturamento</th></tr></thead>
          <tbody>
            {linhaDRE('Faturamento', conta.bruto, { forte: true, sub: `${int(conta.vendas)} vendas vivas` })}
            {linhaDRE('Taxas do gateway', conta.taxas, { sinal: '−' })}
            {linhaDRE('Líquido', conta.liquido, { forte: true, sinal: '=' })}
            {linhaDRE('Anúncios no Meta', conta.anuncios, { sinal: '−' })}
            {linhaDRE('Imposto do Meta', conta.impostoMeta, { sinal: '−', sub: `${num2(cfg.impostoMetaPct)}%` })}
            {conta.linhasVariaveis.map((l) => linhaDRE(l.nome, l.valor, { sinal: '−', sub: l.grupo }))}
            {linhaDRE('Contribuição', conta.contribuicao, { forte: true, sinal: '=', sub: 'antes dos custos fixos' })}
            {conta.linhasFixos.map((l) => linhaDRE(l.nome, l.valor, { sinal: '−', sub: l.grupo }))}
            {linhaDRE('Lucro', conta.lucro, { forte: true, sinal: '=' })}
          </tbody>
        </Tabela>
        <div className="mt-3"><Caixa tom="info">Venda devolvida (reembolso ou chargeback) sai do faturamento do mês em que foi feita. Custos fixos entram pela fração do mês que o período cobre. ROAS de empate = quanto cada R$ 1 de anúncio precisa voltar em vendas para o lucro antes dos fixos dar zero.</Caixa></div>
      </Secao>

      <Secao titulo="Dia a dia" sub="Contribuição = líquido − anúncios − imposto do Meta − custos variáveis (antes dos fixos).">
        {porDia.length ? (
          <Tabela min={620}>
            <thead><tr><th style={thL}>Dia</th><th style={th}>Vendas</th><th style={th}>Faturamento</th><th style={th}>Anúncios</th><th style={th}>ROAS</th><th style={th}>Custo/venda</th><th style={th}>Contribuição</th></tr></thead>
            <tbody>{porDia.map(({ d, ct }) => <tr key={d}><td style={tdL}>{d.split('-').reverse().slice(0, 2).join('/')}</td><td style={td}>{int(ct.vendas)}</td><td style={td}>{brl(ct.bruto)}</td><td style={td}>{brl(ct.anuncios)}</td><td style={td}>{x2(ct.roas)}</td><td style={td}>{ct.custoVenda == null ? '—' : brl(ct.custoVenda)}</td><td style={{ ...td, fontWeight: 700, color: corLucro(ct.contribuicao) }}>{brl(ct.contribuicao)}</td></tr>)}</tbody>
          </Tabela>
        ) : <Vazio>Sem dias no período.</Vazio>}
      </Secao>

      <Secao titulo="Por gateway" sub="Vendas de cada plataforma de pagamento, separadas.">
        {porGateway.length ? (
          <Tabela min={520}>
            <thead><tr><th style={thL}>Gateway</th><th style={th}>Vendas</th><th style={th}>Faturamento</th><th style={th}>Líquido</th><th style={th}>% do faturamento</th><th style={th}>Devoluções</th></tr></thead>
            <tbody>{porGateway.map((p) => <tr key={p.k}><td style={tdL}><strong>{p.k}</strong></td><td style={td}>{int(p.n)}</td><td style={td}>{brl(p.bruto)}</td><td style={td}>{brl(p.liq)}</td><td style={td}>{pct(p.bruto, conta.bruto, 1)}</td><td style={td}>{int(p.reemb)}</td></tr>)}</tbody>
          </Tabela>
        ) : <Vazio>Sem vendas no período.</Vazio>}
      </Secao>

      <Secao titulo="Por produto" sub="Principal, order bumps, upsell e assinatura, pelo nome do produto no gateway.">
        {porProduto.length ? (
          <Tabela min={520}>
            <thead><tr><th style={thL}>Produto</th><th style={th}>Vendas</th><th style={th}>Faturamento</th><th style={th}>Líquido</th><th style={th}>% do faturamento</th></tr></thead>
            <tbody>{porProduto.map((p) => <tr key={p.k}><td style={tdL}>{p.k}</td><td style={td}>{int(p.n)}</td><td style={td}>{brl(p.bruto)}</td><td style={td}>{brl(p.liq)}</td><td style={td}>{pct(p.bruto, conta.bruto, 1)}</td></tr>)}</tbody>
          </Tabela>
        ) : <Vazio>Sem vendas no período.</Vazio>}
      </Secao>

      <Secao titulo="Mês a mês" sub="Últimos 6 meses (o mês atual até hoje).">
        <Tabela min={640}>
          <thead><tr><th style={thL}>Mês</th><th style={th}>Vendas</th><th style={th}>Faturamento</th><th style={th}>Anúncios</th><th style={th}>ROAS</th><th style={th}>Custos</th><th style={th}>Lucro</th><th style={th}>Margem</th></tr></thead>
          <tbody>{[...meses].reverse().map(({ mes, ct }) => <tr key={mes}><td style={tdL}>{mes.split('-').reverse().join('/')}</td><td style={td}>{int(ct.vendas)}</td><td style={td}>{brl0(ct.bruto)}</td><td style={td}>{brl0(ct.anuncios)}</td><td style={td}>{x2(ct.roas)}</td><td style={td}>{brl0(ct.variaveis + ct.fixos + ct.impostoMeta)}</td><td style={{ ...td, fontWeight: 800, color: corLucro(ct.lucro) }}>{brl0(ct.lucro)}</td><td style={td}>{pctv(ct.margem, 0)}</td></tr>)}</tbody>
        </Tabela>
      </Secao>
    </Shell>
  )
}
