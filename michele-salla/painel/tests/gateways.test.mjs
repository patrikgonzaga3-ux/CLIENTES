import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { greenn, hotmart, kiwify, paraISO } from '../lib/gateways.ts'

const ex = (n) => JSON.parse(readFileSync(new URL(`./exemplos/${n}.json`, import.meta.url), 'utf8'))

test('Greenn aprovada (aviso real): valor, líquido, status e rastreio', () => {
  const r = greenn(ex('greenn-aprovada'))
  assert.equal(r.tipo, 'venda')
  const e = r.evento
  assert.equal(e.status, 'aprovada'); assert.equal(e.valor, 37); assert.equal(e.liquido, 34.52)
  assert.ok(e.transacao && e.event_key.startsWith(`greenn-${e.transacao}-paid`))
  assert.ok(/^\d{6,}$/.test(e.src), 'utm_term = id do conjunto')
  assert.ok(e.data_aprovacao && e.data_aprovacao.endsWith('Z'))
  assert.equal(e.email, 'cliente.teste@exemplo.com')
})

test('Greenn reembolsada (aviso real)', () => {
  const r = greenn(ex('greenn-reembolsada'))
  assert.equal(r.tipo, 'venda'); assert.equal(r.evento.status, 'reembolsada'); assert.equal(r.evento.data_aprovacao, null)
})

test('Greenn checkout abandonado (aviso real)', () => {
  const r = greenn(ex('greenn-abandono'))
  assert.equal(r.tipo, 'abandono'); assert.ok(r.abandono.event_key.startsWith('greenn-lead-'))
})

test('Greenn contrato de assinatura é ignorado', () => {
  assert.equal(greenn({ type: 'contract', event: 'contractUpdated', contract: { id: 1, status: 'paid' } }).tipo, 'ignorado')
})

test('Hotmart aprovada (aviso real)', () => {
  const r = hotmart(ex('hotmart-aprovada'))
  assert.equal(r.tipo, 'venda')
  assert.equal(r.evento.status, 'aprovada'); assert.ok(r.evento.valor > 0); assert.ok(r.evento.transacao)
})

test('Kiwify (formato da documentação): centavos viram reais', () => {
  const r = kiwify({ order_id: 'abc123', order_status: 'paid', webhook_event_type: 'order_approved', payment_method: 'pix', created_at: '2026-10-20 10:00:00', approved_date: '2026-10-20 10:05:00',
    Product: { product_id: 'p1', product_name: 'Curso' }, Customer: { full_name: 'Teste', email: 't@t.com', mobile: '+5511999990000' },
    Commissions: { charge_amount: 9700, my_commission: 8730 }, TrackingParameters: { utm_term: '120200000000000001', utm_source: 'FB', utm_content: 'AD 1' } })
  assert.equal(r.tipo, 'venda'); assert.equal(r.evento.valor, 97); assert.equal(r.evento.liquido, 87.3)
  assert.equal(r.evento.status, 'aprovada'); assert.equal(r.evento.src, '120200000000000001')
  assert.equal(r.evento.data_aprovacao, '2026-10-20T13:05:00.000Z')
})

test('datas: com fuso, sem fuso (Brasília) e epoch', () => {
  assert.equal(paraISO('2026-06-25T21:01:22.000000Z'), '2026-06-25T21:01:22.000Z')
  assert.equal(paraISO('2026-06-25 18:01:22'), '2026-06-25T21:01:22.000Z')
  assert.equal(paraISO(1782421282000), '2026-06-25T21:01:22.000Z')
})
