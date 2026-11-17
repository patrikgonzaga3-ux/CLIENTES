// ABA QUIZ CORPO DIVA (17/11): o mesmo painel de comportamento do quiz. Cada tela é um bloco (01 capa … 27 oferta) e cada página é
// promessa + posição da VSL (corpodiva-p1i, -p1o, -p2i, -p2o), para comparar VSL na capa × VSL na oferta. Venda pelo sck.
import { CLIENTE } from '@/cliente.config'
import { compras, pedidos } from '@/lib/dados'
import { porta } from '../_shell'
import { PainelComportamento, type BuscaComportamento } from '../_ui/comportamento-ui'
import { periodo } from '../_ui/periodo'

export const dynamic = 'force-dynamic'

export default async function CorpoDiva({ searchParams }: { searchParams: Promise<BuscaComportamento> }) {
  const b = await porta(); if (b) return b
  const sp = await searchParams
  const per = periodo(sp, '7d')
  const s = CLIENTE.sites.find((x) => x.id === 'corpodiva')!
  const site = { ...s, base: '/painel/corpodiva' }
  const [ps, cs] = await Promise.all([pedidos(per.since, per.until), compras(per.since, per.until)])
  const checkout = { pedidos: ps.map((c) => (c.sck || '').toLowerCase()), vendas: cs.map((c) => (c.sck || '').toLowerCase()) }
  return <PainelComportamento site={site} per={per} sp={sp} checkout={checkout} visitasPadrao={0} />
}
