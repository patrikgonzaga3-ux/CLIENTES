// A conta do lucro do cliente. Sem imports: roda no painel e nos testes (node --test).
//
// Ordem (a mesma da planilha financeira):
//   faturamento bruto (vendas vivas, sem teste)
//   − taxas do gateway            = líquido (vem em cada venda; sem ele, estima pela taxa padrão)
//   − anúncios (gasto do Meta) − imposto do Meta sobre o gasto
//   − custos variáveis (% sobre o faturamento, da planilha)
//   − custos fixos (R$ no mês, da planilha; período parcial = fração do mês)
//   = lucro
// Reembolso: a venda devolvida sai do faturamento (não é "viva"); a lista de reembolsos do
// período fica à parte, pela data em que o dinheiro voltou.

export type Gasto = { mes: string; grupo: string; descricao: string; tipo: 'fixo' | '%'; valor: number; recorrente: boolean }
export type CompraLucro = { valor: number; liquido: number | null }
export type ParteMes = { mes: string; fracao: number } // mês "AAAA-MM" e quanto dele o período cobre (0 a 1)
export type CfgLucro = { impostoMetaPct: number; taxaGatewayPct: number }
export type Linha = { nome: string; grupo: string; valor: number }

const DIA = 86_400_000
const r2 = (n: number) => Math.round(n * 100) / 100

/** Dias de um mês "AAAA-MM". */
export function diasNoMes(mes: string): number {
  const [a, m] = mes.split('-').map(Number)
  return new Date(Date.UTC(a, m, 0)).getUTCDate()
}

/** Quanto de cada mês um período de dias (AAAA-MM-DD, inclusive) cobre. */
export function partesDoPeriodo(diaIni: string, diaFim: string): ParteMes[] {
  const out: ParteMes[] = []
  let t = Date.parse(`${diaIni}T12:00:00Z`)
  const fim = Date.parse(`${diaFim}T12:00:00Z`)
  const conta = new Map<string, number>()
  while (t <= fim) {
    const mes = new Date(t).toISOString().slice(0, 7)
    conta.set(mes, (conta.get(mes) ?? 0) + 1)
    t += DIA
  }
  for (const [mes, dias] of conta) out.push({ mes, fracao: dias / diasNoMes(mes) })
  return out
}

/**
 * Gastos que valem num mês. Uma linha vale no próprio mês e, se for recorrente, nos meses seguintes.
 * Para a mesma despesa (grupo + descrição), vale a linha mais recente até aquele mês: assim, mudar o
 * valor é lançar uma linha nova; uma linha não recorrente muda só aquele mês; recorrente com valor 0 encerra.
 */
export function gastosDoMes(gastos: Gasto[], mes: string): Gasto[] {
  const melhor = new Map<string, Gasto>()
  for (const g of gastos) {
    if (!(g.mes === mes || (g.recorrente && g.mes < mes))) continue
    const k = `${g.grupo.trim().toLowerCase()}|${g.descricao.trim().toLowerCase()}`
    const atual = melhor.get(k)
    if (!atual || g.mes > atual.mes || (g.mes === atual.mes && !g.recorrente)) melhor.set(k, g)
  }
  return [...melhor.values()].filter((g) => g.valor !== 0)
}

export type ContaLucro = {
  vendas: number
  bruto: number
  liquido: number
  taxas: number
  liquidoEstimado: number // quantas vendas tiveram o líquido estimado (gateway não mandou)
  anuncios: number
  impostoMeta: number
  variaveis: number
  fixos: number
  linhasVariaveis: Linha[]
  linhasFixos: Linha[]
  contribuicao: number // líquido − anúncios − imposto do Meta − variáveis (antes dos fixos)
  lucro: number
  margem: number | null
  roas: number | null
  roi: number | null
  custoVenda: number | null
  lucroVenda: number | null
  /** ROAS em que o lucro antes dos custos fixos dá zero (impostos e taxas incluídos) */
  roasEmpate: number | null
  /** ROAS necessário, com o gasto do período, para cobrir também os custos fixos */
  roasEmpateComFixos: number | null
}

export function contaLucro(p: { compras: CompraLucro[]; gastoMeta: number; gastos: Gasto[]; partes: ParteMes[]; cfg: CfgLucro }): ContaLucro {
  const { compras, gastoMeta, gastos, partes, cfg } = p
  const bruto = compras.reduce((a, c) => a + (Number(c.valor) || 0), 0)
  let liquidoEstimado = 0
  const liquido = compras.reduce((a, c) => {
    if (c.liquido != null && Number.isFinite(Number(c.liquido))) return a + Number(c.liquido)
    liquidoEstimado++
    return a + (Number(c.valor) || 0) * (1 - cfg.taxaGatewayPct / 100)
  }, 0)
  const impostoMeta = gastoMeta * (cfg.impostoMetaPct / 100)

  // Custos da planilha, mês a mês, na fração do mês que o período cobre.
  const varMap = new Map<string, Linha>(), fixMap = new Map<string, Linha>()
  let pctTotal = 0 // % sobre o faturamento, ponderado pelos dias de cada mês
  let fixos = 0
  const diasTot = partes.reduce((a, x) => a + x.fracao * diasNoMes(x.mes), 0) || 1
  for (const parte of partes) {
    const peso = (parte.fracao * diasNoMes(parte.mes)) / diasTot
    for (const g of gastosDoMes(gastos, parte.mes)) {
      const k = `${g.grupo}|${g.descricao}`
      if (g.tipo === '%') {
        pctTotal += (g.valor / 100) * peso
        const l = varMap.get(k) ?? { nome: g.descricao, grupo: g.grupo, valor: 0 }
        l.valor += bruto * (g.valor / 100) * peso
        varMap.set(k, l)
      } else {
        const v = g.valor * parte.fracao
        fixos += v
        const l = fixMap.get(k) ?? { nome: g.descricao, grupo: g.grupo, valor: 0 }
        l.valor += v
        fixMap.set(k, l)
      }
    }
  }
  const variaveis = bruto * pctTotal
  const contribuicao = liquido - gastoMeta - impostoMeta - variaveis
  const lucro = contribuicao - fixos
  const vendas = compras.length
  // empate: liquido = r·bruto  →  r·b − pv·b − g(1+pm) − F = 0  →  b/g = (g(1+pm) + F) / (g(r − pv))
  const r = bruto > 0 ? liquido / bruto : 1 - cfg.taxaGatewayPct / 100
  const sobra = r - pctTotal
  const pm = cfg.impostoMetaPct / 100
  const roasEmpate = sobra > 0 ? (1 + pm) / sobra : null
  const roasEmpateComFixos = sobra > 0 && gastoMeta > 0 ? (gastoMeta * (1 + pm) + fixos) / (gastoMeta * sobra) : null
  const ord = (m: Map<string, Linha>) => [...m.values()].map((l) => ({ ...l, valor: r2(l.valor) })).sort((a, b) => b.valor - a.valor)
  return {
    vendas, bruto: r2(bruto), liquido: r2(liquido), taxas: r2(bruto - liquido), liquidoEstimado,
    anuncios: r2(gastoMeta), impostoMeta: r2(impostoMeta), variaveis: r2(variaveis), fixos: r2(fixos),
    linhasVariaveis: ord(varMap), linhasFixos: ord(fixMap),
    contribuicao: r2(contribuicao), lucro: r2(lucro),
    margem: bruto > 0 ? lucro / bruto : null,
    roas: gastoMeta > 0 ? bruto / gastoMeta : null,
    roi: gastoMeta > 0 ? liquido / gastoMeta : null,
    custoVenda: vendas ? gastoMeta / vendas : null,
    lucroVenda: vendas ? lucro / vendas : null,
    roasEmpate, roasEmpateComFixos,
  }
}

/**
 * Projeção do mês corrente: a contribuição por dia até aqui levada até o fim do mês, menos os fixos do mês inteiro.
 * `diasCorridos` conta o dia de hoje como fração (ex.: 22,5 às 12h do dia 23).
 */
export function projecaoMes(contribuicaoAteAgora: number, diasCorridos: number, diasMes: number, fixosMes: number): number | null {
  if (diasCorridos <= 0.25) return null
  return r2((contribuicaoAteAgora / diasCorridos) * diasMes - fixosMes)
}

export type Etapa3x = { etapa: 'clique' | 'ic' | 'compra'; nome: string; qtd: number; custo: number | null; meta: number; status: 'ok' | 'atencao' | 'ruim' | 'sem' }
/** Funil 3x: custo do clique, do initiate checkout e da compra contra metas em fração do ticket. */
export function funil3x(gasto: number, qtd: { cliques: number; ic: number; compras: number }, ticket: number, metas: { clique: number; ic: number; compra: number }): Etapa3x[] {
  const um = (etapa: Etapa3x['etapa'], nome: string, n: number, frac: number): Etapa3x => {
    const meta = ticket * frac
    const custo = n > 0 && gasto > 0 ? gasto / n : null
    const status = custo == null ? 'sem' : custo <= meta ? 'ok' : custo <= meta * 1.3 ? 'atencao' : 'ruim'
    return { etapa, nome, qtd: n, custo: custo == null ? null : r2(custo), meta: r2(meta), status }
  }
  return [um('clique', 'Clique no link', qtd.cliques, metas.clique), um('ic', 'Initiate checkout', qtd.ic, metas.ic), um('compra', 'Compra', qtd.compras, metas.compra)]
}
