// Recebe do /rastreio.js o retrato de cada visita da página de vendas e grava 1 linha por visita em
// pl_comportamento. Só aceita os domínios de CLIENTE.sites, cada um só com os slugs dele.
import { CLIENTE } from '@/cliente.config'
import { gravar } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function siteDaOrigem(origin: string | null) {
  const m = /^https?:\/\/(?:www\.)?([a-z0-9.-]+)(?::\d+)?$/i.exec(origin || '')
  return m ? CLIENTE.sites.find((s) => s.dominio.toLowerCase() === m[1].toLowerCase()) ?? null : null
}
function cors(req: Request): Record<string, string> {
  const o = req.headers.get('origin') || ''
  return siteDaOrigem(o) ? { 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400', Vary: 'Origin' } : {}
}
export function OPTIONS(req: Request) { return new Response(null, { status: 204, headers: cors(req) }) }

const txt = (v: unknown, max = 80) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)
const int = (v: unknown, max = 86_400_000) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0 }
const H6 = 6 * 3600_000

export async function POST(req: Request) {
  const h = cors(req)
  const site = siteDaOrigem(req.headers.get('origin'))
  if (!site) return Response.json({ ok: false }, { status: 403, headers: h })
  let b: Record<string, unknown>
  try { const raw = await req.text(); if (raw.length > 60_000) return Response.json({ ok: false }, { status: 413, headers: h }); b = JSON.parse(raw) } catch { return Response.json({ ok: false }, { status: 400, headers: h }) }
  const id = txt(b.id, 64), slug = txt(b.slug, 60)
  if (!id || !/^[A-Za-z0-9-]{8,64}$/.test(id) || !slug || !slug.startsWith(`${site.prefixo}-`) || !/^[a-z0-9-]{3,60}$/.test(slug)) return Response.json({ ok: false }, { status: 400, headers: h })
  const blocos: Record<string, { ms: number; chegou_ms: number; vezes: number }> = {}
  if (b.blocos && typeof b.blocos === 'object') for (const [k, v] of Object.entries(b.blocos as Record<string, Record<string, unknown>>).slice(0, 40)) {
    if (/^\d\d$/.test(k) && v && typeof v === 'object') blocos[k] = { ms: int(v.ms, H6), chegou_ms: int(v.chegou_ms, H6), vezes: int(v.vezes, 999) }
  }
  const cliques = Array.isArray(b.cliques) ? (b.cliques as Record<string, unknown>[]).slice(0, 150).filter((c) => c && typeof c === 'object').map((c) => ({ ms: int(c.ms, H6), b: int(c.b, 99), o: txt(c.o, 90) ?? '?' })) : []
  const total = int(b.total_ms, H6)
  const r = await gravar('pl_comportamento', {
    id, vid: txt(b.vid, 64), slug, inicio: new Date(Date.now() - total).toISOString(), atualizado: new Date().toISOString(),
    utm_source: txt(b.utm_source, 40), utm_medium: txt(b.utm_medium, 60), utm_campaign: txt(b.utm_campaign, 120), utm_content: txt(b.utm_content, 120), utm_term: txt(b.utm_term, 40),
    fbclid: !!b.fbclid, aparelho: txt(b.aparelho, 12), largura: int(b.largura, 10000), altura: int(b.altura, 10000), ref: txt(b.ref, 120),
    carregou_ms: b.carregou_ms == null ? null : int(b.carregou_ms, 120_000), total_ms: total, ativo_ms: int(b.ativo_ms, H6), rolagem_max: int(b.rolagem_max, 100),
    bloco_max: int(b.bloco_max, 99), ultimo_bloco: int(b.ultimo_bloco, 99), blocos, cliques,
    comprar_ms: b.comprar_ms == null ? null : int(b.comprar_ms, H6), comprar_local: txt(b.comprar_local, 40), saiu: !!b.saiu,
  }, 'id')
  return Response.json({ ok: r.ok }, { status: r.ok ? 200 : 500, headers: h })
}
