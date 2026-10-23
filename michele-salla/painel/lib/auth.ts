// Quem está no painel. Cada pessoa entra com o próprio e-mail e senha (pl_usuarios). O administrador
// (ADMIN_EMAIL) cria a própria senha no primeiro acesso com o código de instalação (PAINEL_SENHA da Vercel)
// e convida os outros por link (aba Acessos). O cookie guarda só o e-mail assinado, nunca a senha.
import 'server-only'
import { createHash } from 'node:crypto'
import { cookies } from 'next/headers'
import { assinarSessao, lerSessao, normEmail } from './senhas'
import { buscarUsuario, emailAdmin, type Papel } from './usuarios'

export const COOKIE = 'pl_sessao'
export const DIAS_SESSAO = 60
const emDemo = () => process.env.DEMO === '1'
/** Código de instalação: só serve para o administrador criar a senha dele no primeiro acesso. */
const codigoInstalacao = () => (process.env.PAINEL_SENHA || '').trim()
export const instalacaoConfigurada = () => emDemo() || Boolean(codigoInstalacao())
export const codigoInstalacaoCerto = (t: string) => Boolean(codigoInstalacao()) && (t ?? '').trim() === codigoInstalacao()
/** Chave das sessões: derivada da chave do banco (secreta e só no servidor). */
const chaveSessao = () => createHash('sha256').update(`painel-sessao:${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}:${codigoInstalacao()}`).digest('hex')

export type Quem = { email: string; papel: Papel }

export async function gravarSessao(email: string) {
  const exp = Date.now() + DIAS_SESSAO * 86_400_000
  ;(await cookies()).set(COOKIE, emDemo() ? 'demo' : assinarSessao(email, exp, chaveSessao()), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: DIAS_SESSAO * 86_400,
  })
}
export async function sair() { (await cookies()).delete(COOKIE) }

/** Pessoa logada agora (confere no banco a cada página: quem foi removido sai na hora). */
export async function quem(): Promise<Quem | null> {
  const c = (await cookies()).get(COOKIE)?.value
  if (emDemo()) return c === 'demo' ? { email: 'demonstracao', papel: 'admin' } : null
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  const email = lerSessao(c, chaveSessao(), Date.now())
  if (!email) return null
  const u = await buscarUsuario(email)
  if (!u) return null
  return { email: u.email, papel: normEmail(u.email) === emailAdmin() ? 'admin' : u.papel }
}
export async function logado(): Promise<boolean> { return (await quem()) != null }
export async function ehAdmin(): Promise<boolean> { return (await quem())?.papel === 'admin' }
