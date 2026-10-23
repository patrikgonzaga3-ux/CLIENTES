import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { lerCSV, gastosDaAba, configDaAba, numeroBR } from '../lib/planilha-ler.ts'

test('números no jeito brasileiro', () => {
  assert.equal(numeroBR('R$ 1.500,50'), 1500.5); assert.equal(numeroBR('12,5%'), 12.5); assert.equal(numeroBR('1.500'), 1500)
  assert.equal(numeroBR('1500.5'), 1500.5); assert.equal(numeroBR(''), null); assert.equal(numeroBR('abc'), null)
})

test('modelo da planilha (modelo/*.csv) é lido sem avisos', () => {
  const g = gastosDaAba(lerCSV(readFileSync(new URL('../modelo/planilha-gastos.csv', import.meta.url), 'utf8')))
  assert.deepEqual(g.avisos, [])
  assert.ok(g.gastos.length >= 5)
  assert.ok(g.gastos.some((x) => x.tipo === '%') && g.gastos.some((x) => x.tipo === 'fixo' && x.recorrente))
  const c = configDaAba(lerCSV(readFileSync(new URL('../modelo/planilha-configuracao.csv', import.meta.url), 'utf8')))
  assert.ok(c.meta_lucro && c.imposto_meta_pct && c.ticket && c.funil3x)
})

test('meses em vários formatos e linha ruim vira aviso', () => {
  const g = gastosDaAba([['Mês', 'Grupo', 'Descrição', 'Tipo', 'Valor', 'Recorrente'], ['11/2026', 'Equipe', 'A', 'Fixo', '1.000', 'sim'], ['nov/2026', 'Equipe', 'B', '%', '5', ''], ['2026-11', 'X', 'C', 'fixo', 'abc', '']])
  assert.equal(g.gastos.length, 2); assert.equal(g.gastos[0].mes, '2026-11'); assert.equal(g.gastos[1].mes, '2026-11')
  assert.equal(g.avisos.length, 1)
})
