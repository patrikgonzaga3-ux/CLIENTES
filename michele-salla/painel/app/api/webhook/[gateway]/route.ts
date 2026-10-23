// Webhook de vendas: https://<painel>/api/webhook/<gateway>?token=<WEBHOOK_TOKEN>
//   greenn  → cadastrar a URL com ?token= na Greenn (Ferramentas → Webhooks)
//   hotmart → cadastrar a URL; a Hotmart manda o hottok no cabeçalho (HOTMART_HOTTOK), ou use ?token=
//   kiwify  → cadastrar a URL com ?token=; se a Kiwify mandar ?signature=, confere com KIWIFY_TOKEN
// Sem o token certo: 401 (ninguém inventa venda). Com token: sempre 200, mesmo com erro de gravação (os
// gateways desligam webhooks que erram muito); o erro fica no log e na aba Fontes.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { CLIENTE } from '@/cliente.config'
import { gravar, marcarFonte } from '@/lib/db'
import { NORMALIZA, type Gateway } from '@/lib/gateways'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const igual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

export async function POST(req: Request, ctx: { params: Promise<{ gateway: string }> }) {
  const gw = (await ctx.params).gateway.toLowerCase() as Gateway
  if (!(gw in NORMALIZA) || !CLIENTE.gateways.includes(gw)) return new Response('gateway não ligado neste painel', { status: 404 })
  const texto = await req.text()
  const url = new URL(req.url)
  const token = (process.env.WEBHOOK_TOKEN || '').trim()
  const enviado = (url.searchParams.get('token') || req.headers.get('x-hotmart-hottok') || '').trim()
  let ok = Boolean(token) && Boolean(enviado) && igual(enviado, token)
  if (!ok && gw === 'hotmart' && process.env.HOTMART_HOTTOK) ok = igual(enviado, process.env.HOTMART_HOTTOK.trim())
  const assinatura = url.searchParams.get('signature')
  if (!ok && gw === 'kiwify' && assinatura && process.env.KIWIFY_TOKEN) ok = igual(assinatura, createHmac('sha1', process.env.KIWIFY_TOKEN.trim()).update(texto).digest('hex'))
  if (!ok) return new Response('Unauthorized', { status: 401 })

  let body: unknown
  try { body = JSON.parse(texto) } catch { return new Response('Bad Request', { status: 400 }) }
  try {
    const r = NORMALIZA[gw](body)
    if (r.tipo === 'venda') {
      const g = await gravar('pl_eventos', r.evento, 'event_key', true)
      await marcarFonte(`gateway:${gw}`, g.ok, g.ok ? `último aviso: venda ${r.evento.transacao} (${r.evento.status})` : `falha ao gravar: ${g.erro}`)
    } else if (r.tipo === 'abandono') {
      const g = await gravar('pl_abandonos', r.abandono, 'event_key', true)
      await marcarFonte(`gateway:${gw}`, g.ok, g.ok ? 'último aviso: checkout abandonado' : `falha ao gravar: ${g.erro}`)
    } else {
      console.log(`[webhook ${gw}] ignorado: ${r.motivo}`)
    }
  } catch (e) {
    console.error(`[webhook ${gw}]`, e)
    await marcarFonte(`gateway:${gw}`, false, `erro ao ler o aviso: ${e instanceof Error ? e.message : e}`).catch(() => {})
  }
  return new Response('ok', { status: 200 })
}
