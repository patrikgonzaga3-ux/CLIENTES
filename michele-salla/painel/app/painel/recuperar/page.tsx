// ABA RECUPERAR VENDAS: quem gerou Pix/boleto e não pagou, quem teve o cartão recusado e quem preencheu o checkout
// e saiu, só quem NÃO comprou depois. Botão de WhatsApp com a mensagem pronta (sem desconto).
import { CLIENTE } from '@/cliente.config'
import { abandonos as lerAbandonos, compras as lerCompras, pedidos as lerPedidos } from '@/lib/dados'
import { porta, Shell } from '../_shell'
import { brl, brl0, horaBR, int, primeiroNome, telMask, telWa } from '../_ui/fmt'
import { FiltroPeriodo, periodo, type SP } from '../_ui/periodo'
import { Caixa, Grade, Secao, Tabela, Tile, Titulo, Vazio, td, tdL, th, thL } from '../_ui/ui'

export const dynamic = 'force-dynamic'
type Item = { id: string; quando: string; nome: string | null; tel: string | null; email: string | null; valor: number; tipo: 'pix' | 'recusado' | 'abandono'; produto: string | null }
const ROTULO = { pix: 'Pix ou boleto gerado e não pago', recusado: 'Cartão recusado', abandono: 'Saiu do checkout sem pagar' }

function msg(nome: string, tipo: Item['tipo']) {
  const ola = `Oi, ${nome}! Tudo bem? Aqui é da equipe ${CLIENTE.nome}.`
  if (tipo === 'recusado') return `${ola} Vi que o cartão não passou na sua compra. Quer que eu te mande o link com Pix para você garantir agora?`
  if (tipo === 'abandono') return `${ola} Vi que você começou sua inscrição e não chegou a finalizar. Ficou alguma dúvida? Posso te ajudar a concluir.`
  return `${ola} Vi que você gerou o pagamento e ainda não concluiu. Posso te ajudar a finalizar? Se quiser, te mando o Pix de novo.`
}
function Wa({ tel, texto }: { tel: string | null; texto: string }) {
  const n = telWa(tel)
  if (!n) return <span style={{ color: 'var(--mute)' }}>sem telefone</span>
  return <a href={`https://wa.me/${n}?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 800, color: '#fff', background: 'var(--g)', padding: '5px 10px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap', fontSize: 12.5 }}>WhatsApp</a>
}

export default async function Recuperar({ searchParams }: { searchParams: Promise<SP> }) {
  const b = await porta(); if (b) return b
  const sp = await searchParams
  const per = periodo(sp, '7d')
  const [ps, cs, ab] = await Promise.all([lerPedidos(per.since, per.until), lerCompras(per.since, new Date().toISOString()), lerAbandonos(per.since, per.until)])
  // comprou depois? (mesmo e-mail ou telefone com venda viva depois do pedido)
  const tel = (t: string | null) => (t || '').replace(/\D/g, '').slice(-9)
  const comprouDepois = (email: string | null, t: string | null, quando: string) => cs.some((c) => (c.aprovada_em ?? '') >= quando && ((email && c.email === email.toLowerCase().trim()) || (tel(t) && tel(c.telefone) === tel(t))))
  const itens: Item[] = []
  const vistos = new Set<string>()
  const add = (i: Item) => { const k = i.email || tel(i.tel) || i.id; if (vistos.has(k)) return; vistos.add(k); itens.push(i) }
  for (const p of ps) {
    if (p.ultimo_status !== 'aguardando' && p.ultimo_status !== 'recusada') continue
    if (comprouDepois(p.email, p.telefone, p.pedido_em)) continue
    add({ id: p.transacao, quando: p.pedido_em, nome: p.nome, tel: p.telefone, email: p.email, valor: p.valor, tipo: p.ultimo_status === 'recusada' ? 'recusado' : 'pix', produto: p.produto_nome })
  }
  for (const a of ab) {
    if (comprouDepois(a.email, a.telefone, a.quando ?? a.recebido_em)) continue
    add({ id: a.event_key, quando: a.quando ?? a.recebido_em, nome: a.nome, tel: a.telefone, email: a.email, valor: a.valor ?? 0, tipo: 'abandono', produto: a.produto_nome })
  }
  itens.sort((x, y) => y.quando.localeCompare(x.quando))
  const tot = (t: Item['tipo']) => itens.filter((i) => i.tipo === t)

  return (
    <Shell active="recuperar">
      <Titulo titulo="Recuperar vendas" sub="Quem quase comprou e não comprou depois, uma linha por pessoa. Quanto mais cedo a mensagem, mais recupera (o ideal é até 1 hora)." />
      <FiltroPeriodo per={per} presets={[['hoje', 'Hoje'], ['ontem', 'Ontem'], ['7d', '7 dias'], ['30d', '30 dias']]} />
      <Grade min={200}>
        {(['pix', 'recusado', 'abandono'] as const).map((t) => <Tile key={t} label={ROTULO[t]} value={int(tot(t).length)} sub={brl0(tot(t).reduce((s, i) => s + i.valor, 0))} cor={tot(t).length ? 'var(--pn-amar)' : undefined} />)}
      </Grade>
      <Secao titulo="Lista para chamar" sub="O botão abre o WhatsApp com a mensagem pronta. A mensagem não oferece desconto.">
        {itens.length ? (
          <Tabela min={760}>
            <thead><tr><th style={thL}>Quando</th><th style={thL}>Pessoa</th><th style={thL}>Situação</th><th style={th}>Valor</th><th style={thL}>Ação</th></tr></thead>
            <tbody>{itens.map((i) => <tr key={i.id}><td style={tdL}>{horaBR(i.quando)}</td><td style={tdL}><strong>{primeiroNome(i.nome)}</strong> <span style={{ color: 'var(--mute)' }}>{telMask(i.tel)}</span>{i.produto && <div style={{ color: 'var(--mute)', fontSize: 11.5 }}>{i.produto}</div>}</td><td style={tdL}>{ROTULO[i.tipo]}</td><td style={td}>{brl(i.valor)}</td><td style={tdL}><Wa tel={i.tel} texto={msg(primeiroNome(i.nome), i.tipo)} /></td></tr>)}</tbody>
          </Tabela>
        ) : <Vazio>Ninguém para recuperar no período.</Vazio>}
        <div className="mt-3"><Caixa tom="info">O checkout abandonado só aparece se o gateway mandar esse aviso (Greenn: evento de lead; Hotmart: abandono de carrinho; Kiwify: carrinho abandonado) para o mesmo webhook.</Caixa></div>
      </Secao>
    </Shell>
  )
}
