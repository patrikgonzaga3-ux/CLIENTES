// Pessoas com acesso ao painel e convites (tabelas pl_usuarios e pl_convites). Só no servidor.
import 'server-only'
import { apagar, atualizar, gravar, ler } from './db'
import { hashToken, normEmail, novoToken } from './senhas'

const q = encodeURIComponent
export type Papel = 'admin' | 'convidado'
export type Usuario = { email: string; nome: string | null; papel: Papel; senha_hash: string; criado_em: string; ultimo_acesso: string | null }
export type Convite = { token_hash: string; criado_por: string; criado_em: string; expira_em: string; usado_em: string | null; usado_por: string | null; nota: string | null; email_destino: string | null }

/** E-mail do administrador (quem convida). Vercel: ADMIN_EMAIL; padrão: o do Patrik. */
export const emailAdmin = () => normEmail(process.env.ADMIN_EMAIL || 'patrikgonzaga2@gmail.com')

export async function buscarUsuario(email: string): Promise<Usuario | null> {
  const r = await ler<Usuario>('pl_usuarios', `select=*&email=eq.${q(normEmail(email))}&limit=1`)
  return r[0] ?? null
}
export async function listarUsuarios(): Promise<Usuario[]> {
  return ler<Usuario>('pl_usuarios', 'select=email,nome,papel,criado_em,ultimo_acesso&order=criado_em.asc')
}
export async function gravarUsuario(u: { email: string; papel: Papel; senha_hash: string; nome?: string | null }) {
  return gravar('pl_usuarios', { email: normEmail(u.email), papel: u.papel, senha_hash: u.senha_hash, nome: u.nome ?? null }, 'email')
}
export async function marcarAcesso(email: string) {
  return atualizar('pl_usuarios', `email=eq.${q(normEmail(email))}`, { ultimo_acesso: new Date().toISOString() })
}
export async function removerUsuario(email: string) {
  if (normEmail(email) === emailAdmin()) return false
  return apagar('pl_usuarios', `email=eq.${q(normEmail(email))}`)
}

/** Cria um convite de uso único, válido por `dias`. Devolve o token (vai no link; o banco guarda só o hash). */
// emailDestino preenchido = link de troca de senha daquela pessoa (só funciona com o e-mail dela).
export async function criarConvite(criadoPor: string, nota: string | null, emailDestino: string | null = null, dias = 7): Promise<{ ok: boolean; token?: string; erro?: string }> {
  const { token, hash } = novoToken()
  const r = await gravar('pl_convites', { token_hash: hash, criado_por: normEmail(criadoPor), nota, email_destino: emailDestino ? normEmail(emailDestino) : null, expira_em: new Date(Date.now() + dias * 86_400_000).toISOString() }, 'token_hash')
  return r.ok ? { ok: true, token } : { ok: false, erro: r.erro }
}
/** Convite que ainda vale (não usado e dentro do prazo). */
export async function conviteValido(token: string): Promise<Convite | null> {
  if (!token || token.length < 20) return null
  const r = await ler<Convite>('pl_convites', `select=*&token_hash=eq.${hashToken(token)}&limit=1`)
  const c = r[0]
  if (!c || c.usado_em || Date.parse(c.expira_em) <= Date.now()) return null
  return c
}
/** Marca o convite como usado. Só dá certo uma vez (dois cliques ao mesmo tempo não usam o mesmo convite). */
export async function usarConvite(token: string, email: string): Promise<boolean> {
  return 1 === await atualizar('pl_convites', `token_hash=eq.${hashToken(token)}&usado_em=is.null`, { usado_em: new Date().toISOString(), usado_por: normEmail(email) })
}
export async function listarConvites(): Promise<Convite[]> {
  return ler<Convite>('pl_convites', 'select=token_hash,criado_por,criado_em,expira_em,usado_em,usado_por,nota,email_destino&order=criado_em.desc&limit=30')
}
export async function cancelarConvite(tokenHash: string) {
  return apagar('pl_convites', `token_hash=eq.${q(tokenHash)}&usado_em=is.null`)
}
