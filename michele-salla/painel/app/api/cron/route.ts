// Robôs de hora em hora (Meta + planilha). Chamado pelo agendamento do Supabase (pg_cron, de hora em hora)
// e pelo da Vercel (1x por dia, reserva). Protegido por senha: ?key=<senha> ou o cabeçalho
// Authorization: Bearer <senha> (a Vercel manda sozinha o CRON_SECRET).
// Vale o CRON_SECRET da Vercel OU a senha cujo sha256 está em pl_segredos (chave 'cron'). Assim o robô do
// Supabase funciona sem precisar mexer na Vercel: a senha fica no Vault e só o hash fica na tabela.
import { createHash, timingSafeEqual } from 'node:crypto'
import { ler } from '@/lib/db'
import { rodarRobos } from '@/lib/robos'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const igual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

async function autorizado(k: string) {
  if (!k) return false
  const s = (process.env.CRON_SECRET || '').trim()
  if (s && igual(k, s)) return true
  const linhas = await ler<{ hash: string }>('pl_segredos', 'select=hash&chave=eq.cron')
  const hash = createHash('sha256').update(k).digest('hex')
  return linhas.some((l) => typeof l.hash === 'string' && igual(l.hash, hash))
}

async function roda(req: Request) {
  const k = new URL(req.url).searchParams.get('key') || (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!(await autorizado(k.trim()))) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true, ...(await rodarRobos(3)) })
}
export const GET = roda
export const POST = roda
