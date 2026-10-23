// ABA COMPORTAMENTO NA PÁGINA: onde a pessoa para, quanto tempo fica em cada bloco, onde clica e quanto demora
// para comprar, com o gargalo da visita até a venda. Pedido e venda vêm do gateway pelo sck (página) do link.
import { CLIENTE } from '@/cliente.config'
import { compras, pedidos } from '@/lib/dados'
import { porta } from '../_shell'
import { PainelComportamento, type BuscaComportamento } from '../_ui/comportamento-ui'
import { periodo } from '../_ui/periodo'

export const dynamic = 'force-dynamic'

export default async function Pagina({ searchParams }: { searchParams: Promise<BuscaComportamento & { site?: string }> }) {
  const b = await porta(); if (b) return b
  const sp = await searchParams
  const per = periodo(sp, '7d')
  const s = CLIENTE.sites.find((x) => x.id === sp.site) ?? CLIENTE.sites[0]
  // Mais de um site: o 1º abre por padrão; os outros por /painel/pagina?site=<id> (os filtros voltam ao 1º).
  const site = { ...s, base: '/painel/pagina' }
  const [ps, cs] = await Promise.all([pedidos(per.since, per.until), compras(per.since, per.until)])
  const checkout = { pedidos: ps.map((c) => (c.sck || '').toLowerCase()), vendas: cs.map((c) => (c.sck || '').toLowerCase()) }
  return <PainelComportamento site={site} per={per} sp={sp} checkout={checkout} visitasPadrao={0} />
}
