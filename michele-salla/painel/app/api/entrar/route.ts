// Entrar com e-mail e senha. Primeiro acesso do administrador: e-mail dele + senha nova + código de instalação.
import { codigoInstalacaoCerto, gravarSessao, sair } from '@/lib/auth'
import { conferirSenha, emailValido, gerarHashSenha, normEmail, problemaSenha } from '@/lib/senhas'
import { buscarUsuario, emailAdmin, gravarUsuario, marcarAcesso } from '@/lib/usuarios'

export const runtime = 'nodejs'
// trava simples contra chute de senha: 5 erros por e-mail em 15 minutos
const erros = new Map<string, number[]>()
const JANELA = 15 * 60_000
function travado(email: string) { const l = (erros.get(email) ?? []).filter((t) => Date.now() - t < JANELA); erros.set(email, l); return l.length >= 5 }
function errou(email: string) { erros.set(email, [...(erros.get(email) ?? []), Date.now()]) }
const nao = (msg: string, status = 401, extra: object = {}) => Response.json({ ok: false, msg, ...extra }, { status })

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { email?: string; senha?: string; repetir?: string; instalacao?: string }
  const senha = b.senha ?? ''
  if (process.env.DEMO === '1') {
    if (senha.trim() !== 'demo') return nao('Senha incorreta.')
    await gravarSessao('demonstracao'); return Response.json({ ok: true })
  }
  const email = normEmail(b.email ?? '')
  if (!emailValido(email)) return nao('Escreva um e-mail válido.', 400)
  if (travado(email)) return nao('Muitas tentativas. Espere 15 minutos.', 429)

  const u = await buscarUsuario(email)
  // administrador: com o código de instalação cria a senha (1º acesso) ou troca (esqueceu)
  if (email === emailAdmin() && b.instalacao) {
    if (!codigoInstalacaoCerto(b.instalacao)) { errou(email); return nao('Código de instalação incorreto.', 401, { primeiroAcesso: true }) }
    const p = problemaSenha(senha, b.repetir)
    if (p) return nao(p, 400, { primeiroAcesso: true })
    const r = await gravarUsuario({ email, papel: 'admin', senha_hash: gerarHashSenha(senha) })
    if (!r.ok) return nao('O banco não respondeu. Tente de novo.', 500, { primeiroAcesso: true })
    await gravarSessao(email); await marcarAcesso(email)
    return Response.json({ ok: true })
  }
  if (u) {
    if (!conferirSenha(senha, u.senha_hash)) { errou(email); return nao('E-mail ou senha incorretos.') }
    await gravarSessao(email); await marcarAcesso(email)
    return Response.json({ ok: true })
  }
  // primeiro acesso do administrador: pede o código de instalação para criar a senha
  if (email === emailAdmin()) return nao('Primeiro acesso: crie sua senha.', 409, { primeiroAcesso: true })
  errou(email)
  return nao('E-mail ou senha incorretos.')
}
export async function DELETE() {
  await sair()
  return Response.json({ ok: true })
}
