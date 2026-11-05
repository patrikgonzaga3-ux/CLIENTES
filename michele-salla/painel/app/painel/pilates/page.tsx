// ABA QUIZ PILATES: o mesmo painel de comportamento, para o quiz. Cada tela é um bloco (01 capa … 20 oferta) e cada
// capa/promessa é uma página (pilates-p1 … pilates-p5), com abas para comparar as promessas. Pedido e venda pelo sck=pilates-pN.
import { CLIENTE } from '@/cliente.config'
import { compras, pedidos } from '@/lib/dados'
import { porta } from '../_shell'
import { PainelComportamento, type BuscaComportamento } from '../_ui/comportamento-ui'
import { periodo } from '../_ui/periodo'

export const dynamic = 'force-dynamic'

export default async function Pilates({ searchParams }: { searchParams: Promise<BuscaComportamento> }) {
  const b = await porta(); if (b) return b
  const sp = await searchParams
  const per = periodo(sp, '7d')
  const s = CLIENTE.sites.find((x) => x.id === 'pilates')!
  const site = { ...s, base: '/painel/pilates' }
  const [ps, cs] = await Promise.all([pedidos(per.since, per.until), compras(per.since, per.until)])
  const checkout = { pedidos: ps.map((c) => (c.sck || '').toLowerCase()), vendas: cs.map((c) => (c.sck || '').toLowerCase()) }
  return <PainelComportamento site={site} per={per} sp={sp} checkout={checkout} visitasPadrao={0} />
}
