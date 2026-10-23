// Senha do painel (PAINEL_SENHA). O cookie guarda só o hash da senha, nunca a senha.
import 'server-only'
import { createHash } from 'node:crypto'
import { cookies } from 'next/headers'

export const COOKIE = 'pl_auth'
const senha = () => (process.env.PAINEL_SENHA || (process.env.DEMO === '1' ? 'demo' : '')).trim()
export const senhaConfigurada = () => Boolean(senha())
export const hashSenha = (s: string) => createHash('sha256').update(`painel-lucro:${s}`).digest('hex')
export async function logado(): Promise<boolean> {
  const s = senha()
  if (!s) return false
  return (await cookies()).get(COOKIE)?.value === hashSenha(s)
}
export const senhaCerta = (tentativa: string) => Boolean(senha()) && tentativa.trim() === senha()
