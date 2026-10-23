// Senhas, convites e sessão do painel. Só usa node:crypto: roda no servidor e nos testes (node --test).
// A senha de cada pessoa nunca é guardada: só o resultado do scrypt (com sal). O convite também: o banco guarda só o hash.
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export const SENHA_MIN = 8
const N = 16384, R = 8, P = 1, LEN = 32

export const normEmail = (e: string) => (e ?? '').trim().toLowerCase()
export const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normEmail(e))

/** "scrypt$<sal>$<hash>" (base64url). */
export function gerarHashSenha(senha: string): string {
  const sal = randomBytes(16)
  const h = scryptSync(senha, sal, LEN, { N, r: R, p: P })
  return `scrypt$${sal.toString('base64url')}$${h.toString('base64url')}`
}
export function conferirSenha(senha: string, guardado: string | null | undefined): boolean {
  const [alg, salTxt, hTxt] = String(guardado ?? '').split('$')
  if (alg !== 'scrypt' || !salTxt || !hTxt) return false
  const esperado = Buffer.from(hTxt, 'base64url')
  const h = scryptSync(senha, Buffer.from(salTxt, 'base64url'), esperado.length, { N, r: R, p: P })
  return h.length === esperado.length && timingSafeEqual(h, esperado)
}

/** Confere a senha nova. Devolve o erro em português ou null. */
export function problemaSenha(senha: string, repetida?: string): string | null {
  if ((senha ?? '').length < SENHA_MIN) return `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`
  if (repetida != null && senha !== repetida) return 'As duas senhas não estão iguais.'
  return null
}

/** Token de convite (vai no link) e o hash dele (vai para o banco). */
export function novoToken(): { token: string; hash: string } {
  const token = randomBytes(24).toString('base64url')
  return { token, hash: hashToken(token) }
}
export const hashToken = (t: string) => createHash('sha256').update(`convite:${t}`).digest('hex')

/** Sessão: "<email em base64url>.<expira em ms>.<assinatura>". A chave fica só no servidor. */
export function assinarSessao(email: string, expiraMs: number, chave: string): string {
  const e = Buffer.from(normEmail(email)).toString('base64url')
  const base = `${e}.${expiraMs}`
  return `${base}.${createHmac('sha256', chave).update(base).digest('base64url')}`
}
export function lerSessao(cookie: string | null | undefined, chave: string, agoraMs: number): string | null {
  const [e, exp, ass] = String(cookie ?? '').split('.')
  if (!e || !exp || !ass || !chave) return null
  const certa = createHmac('sha256', chave).update(`${e}.${exp}`).digest('base64url')
  const a = Buffer.from(ass), b = Buffer.from(certa)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  if (!(Number(exp) > agoraMs)) return null
  return Buffer.from(e, 'base64url').toString()
}
