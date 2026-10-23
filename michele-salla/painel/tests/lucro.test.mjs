import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contaLucro, gastosDoMes, partesDoPeriodo, funil3x, projecaoMes, diasNoMes } from '../lib/lucro.ts'

const G = [
  { mes: '2026-10', grupo: 'Equipe', descricao: 'Editor', tipo: 'fixo', valor: 3000, recorrente: true },
  { mes: '2026-10', grupo: 'Impostos', descricao: 'Simples', tipo: '%', valor: 6, recorrente: true },
  { mes: '2026-11', grupo: 'Equipe', descricao: 'Editor', tipo: 'fixo', valor: 3600, recorrente: true }, // aumento
  { mes: '2026-11', grupo: 'Ferramentas', descricao: 'Evento único', tipo: 'fixo', valor: 500, recorrente: false },
  { mes: '2027-01', grupo: 'Equipe', descricao: 'Editor', tipo: 'fixo', valor: 0, recorrente: true }, // encerra
]

test('gastos do mês: recorrente, aumento, só no mês e encerramento', () => {
  assert.deepEqual(gastosDoMes(G, '2026-10').map((g) => g.valor).sort((a, b) => a - b), [6, 3000])
  assert.deepEqual(gastosDoMes(G, '2026-11').map((g) => g.valor).sort((a, b) => a - b), [6, 500, 3600])
  assert.deepEqual(gastosDoMes(G, '2026-12').map((g) => g.valor).sort((a, b) => a - b), [6, 3600])
  assert.deepEqual(gastosDoMes(G, '2027-01').map((g) => g.valor), [6])
  assert.deepEqual(gastosDoMes(G, '2026-09'), [])
})

test('partes do período e dias do mês', () => {
  assert.equal(diasNoMes('2026-02'), 28)
  assert.deepEqual(partesDoPeriodo('2026-10-01', '2026-10-31'), [{ mes: '2026-10', fracao: 1 }])
  const p = partesDoPeriodo('2026-10-30', '2026-11-02')
  assert.equal(p.length, 2)
  assert.equal(p[0].mes, '2026-10'); assert.equal(p[0].fracao, 2 / 31)
  assert.equal(p[1].mes, '2026-11'); assert.equal(p[1].fracao, 2 / 30)
})

test('conta do lucro de um mês inteiro bate com a conta à mão', () => {
  // 100 vendas de R$ 100 com líquido R$ 90; R$ 4.000 de Meta; imposto Meta 12,5%; Simples 6%; editor R$ 3.000
  const compras = Array.from({ length: 100 }, () => ({ valor: 100, liquido: 90 }))
  const c = contaLucro({ compras, gastoMeta: 4000, gastos: G, partes: [{ mes: '2026-10', fracao: 1 }], cfg: { impostoMetaPct: 12.5, taxaGatewayPct: 10 } })
  assert.equal(c.bruto, 10000); assert.equal(c.liquido, 9000); assert.equal(c.taxas, 1000)
  assert.equal(c.impostoMeta, 500); assert.equal(c.variaveis, 600); assert.equal(c.fixos, 3000)
  assert.equal(c.contribuicao, 9000 - 4000 - 500 - 600)
  assert.equal(c.lucro, 900)
  assert.equal(c.roas, 2.5); assert.equal(c.custoVenda, 40); assert.equal(c.lucroVenda, 9)
  // empate sem fixos: (1,125) / (0,9 − 0,06) = 1,3393
  assert.ok(Math.abs(c.roasEmpate - 1.125 / 0.84) < 1e-9)
  // com fixos: faturamento que zera o lucro = (4000·1,125 + 3000) / 0,84 = 8928,57 → ROAS 2,232
  assert.ok(Math.abs(c.roasEmpateComFixos - (4000 * 1.125 + 3000) / (4000 * 0.84)) < 1e-9)
  // conferência: com esse ROAS o lucro dá zero
  const b = c.roasEmpateComFixos * 4000
  assert.ok(Math.abs(b * 0.9 - 4000 * 1.125 - b * 0.06 - 3000) < 1e-6)
})

test('líquido estimado quando o gateway não manda e fixos proporcionais ao período', () => {
  const c = contaLucro({ compras: [{ valor: 200, liquido: null }], gastoMeta: 0, gastos: G, partes: partesDoPeriodo('2026-10-01', '2026-10-10'), cfg: { impostoMetaPct: 12.5, taxaGatewayPct: 10 } })
  assert.equal(c.liquido, 180); assert.equal(c.liquidoEstimado, 1)
  assert.equal(c.fixos, Math.round(3000 * 10 / 31 * 100) / 100)
  assert.equal(c.roas, null)
})

test('funil 3x: status por etapa', () => {
  const f = funil3x(1000, { cliques: 400, ic: 50, compras: 30 }, 67, { clique: 0.04, ic: 0.23, compra: 0.45 })
  assert.equal(f[0].custo, 2.5); assert.equal(f[0].status, 'ok') // meta 2,68
  assert.equal(f[1].custo, 20); assert.equal(f[1].status, 'atencao') // meta 15,41; 20 ≤ 20,03
  assert.equal(f[2].custo, 33.33); assert.equal(f[2].status, 'atencao') // meta 30,15
  assert.equal(funil3x(0, { cliques: 0, ic: 0, compras: 0 }, 67, { clique: 0.04, ic: 0.23, compra: 0.45 })[0].status, 'sem')
  assert.equal(projecaoMes(1000, 10, 30, 2000), 1000)
  assert.equal(projecaoMes(1000, 0, 30, 2000), null)
})
