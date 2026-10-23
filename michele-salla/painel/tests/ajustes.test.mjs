import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mesclarAjustes, validarAjuste, validarGasto, mesDeTexto } from '../lib/planilha-ler.ts'

test('mês em vários formatos', () => {
  assert.equal(mesDeTexto('2026-10'), '2026-10')
  assert.equal(mesDeTexto('2026-1'), '2026-01')
  assert.equal(mesDeTexto('10/2026'), '2026-10')
  assert.equal(mesDeTexto('out/2026'), '2026-10')
  assert.equal(mesDeTexto('outubro 2026'), '2026-10')
  assert.equal(mesDeTexto('2026-13'), '')
  assert.equal(mesDeTexto('ontem'), '')
})

test('painel vale mais que a planilha; vazio volta para a planilha', () => {
  const r = mesclarAjustes({ meta_lucro: '20000', ticket: '97' }, { meta_lucro: '15000', ticket: '', funil3x: '4 / 23 / 45' })
  assert.deepEqual(r.valores, { meta_lucro: '15000', ticket: '97', funil3x: '4 / 23 / 45' })
  assert.deepEqual(r.doPainel.sort(), ['funil3x', 'meta_lucro'])
})

test('valores digitados nos ajustes', () => {
  assert.deepEqual(validarAjuste('meta_lucro', 'R$ 20.000,00'), { ok: true, valor: '20000' })
  assert.deepEqual(validarAjuste('imposto_meta_pct', '12,5%'), { ok: true, valor: '12.5' })
  assert.deepEqual(validarAjuste('funil3x', '4/23/45'), { ok: true, valor: '4 / 23 / 45' })
  assert.deepEqual(validarAjuste('ticket', ''), { ok: true, valor: null })
  assert.deepEqual(validarAjuste('whatsapp', '+55 (54) 99999-0000'), { ok: true, valor: '5554999990000' })
  assert.equal(validarAjuste('funil3x', '4/23').ok, false)
  assert.equal(validarAjuste('imposto_meta_pct', '150').ok, false)
  assert.equal(validarAjuste('meta_lucro', 'muito').ok, false)
  assert.equal(validarAjuste('senha', 'x').ok, false)
})

test('gasto digitado nos ajustes', () => {
  assert.deepEqual(validarGasto({ mes: '10/2026', grupo: 'Equipe', descricao: 'Gestor', tipo: 'fixo', valor: '2.500,00', recorrente: true }),
    { ok: true, gasto: { mes: '2026-10', grupo: 'Equipe', descricao: 'Gestor', tipo: 'fixo', valor: 2500, recorrente: true } })
  assert.deepEqual(validarGasto({ mes: '2026-10', grupo: '', descricao: 'Imposto', tipo: '%', valor: '6' }),
    { ok: true, gasto: { mes: '2026-10', grupo: 'Outros', descricao: 'Imposto', tipo: '%', valor: 6, recorrente: false } })
  assert.equal(validarGasto({ mes: 'x', descricao: 'a', tipo: 'fixo', valor: '1' }).ok, false)
  assert.equal(validarGasto({ mes: '2026-10', descricao: '', tipo: 'fixo', valor: '1' }).ok, false)
  assert.equal(validarGasto({ mes: '2026-10', descricao: 'a', tipo: 'outro', valor: '1' }).ok, false)
  assert.equal(validarGasto({ mes: '2026-10', descricao: 'a', tipo: '%', valor: '120' }).ok, false)
})
