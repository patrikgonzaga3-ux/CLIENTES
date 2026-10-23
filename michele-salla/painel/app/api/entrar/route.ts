import { cookies } from 'next/headers'
import { COOKIE, hashSenha, senhaCerta } from '@/lib/auth'

export const runtime = 'nodejs'
export async function POST(req: Request) {
  const { senha } = (await req.json().catch(() => ({}))) as { senha?: string }
  if (!senha || !senhaCerta(senha)) return Response.json({ ok: false }, { status: 401 })
  ;(await cookies()).set(COOKIE, hashSenha(senha.trim()), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 60 })
  return Response.json({ ok: true })
}
export async function DELETE() {
  ;(await cookies()).delete(COOKIE)
  return Response.json({ ok: true })
}
