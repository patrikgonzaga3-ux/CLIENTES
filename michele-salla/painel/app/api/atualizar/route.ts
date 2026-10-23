// Botão "Atualizar" do painel: roda os robôs agora (só logado). Trava de 1 minuto entre cliques.
import { logado } from '@/lib/auth'
import { rodarRobos } from '@/lib/robos'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60
let ultimo = 0

export async function POST() {
  if (!(await logado())) return Response.json({ ok: false }, { status: 401 })
  if (Date.now() - ultimo < 60_000) return Response.json({ ok: true, pulou: 'atualizado há menos de 1 minuto' })
  ultimo = Date.now()
  const r = await rodarRobos(2)
  return Response.json({ ok: !String(r.meta).startsWith('erro') && !String(r.planilha).startsWith('erro'), ...r })
}
