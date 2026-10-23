// Robôs de hora em hora (Meta + planilha). Chamado pelo agendamento do Supabase (pg_cron, de hora em hora)
// e pelo da Vercel (1x por dia, reserva). Protegido por CRON_SECRET: ?key=<CRON_SECRET> ou o cabeçalho
// Authorization: Bearer <CRON_SECRET> (a Vercel manda sozinha).
import { rodarRobos } from '@/lib/robos'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function roda(req: Request) {
  const s = (process.env.CRON_SECRET || '').trim()
  const k = new URL(req.url).searchParams.get('key') || (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!s || k !== s) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true, ...(await rodarRobos(3)) })
}
export const GET = roda
export const POST = roda
