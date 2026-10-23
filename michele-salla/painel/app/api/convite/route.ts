// Convites. POST com token: a pessoa convidada cria o acesso (e-mail + senha dela). POST sem token: o administrador
// gera um link novo. DELETE: o administrador cancela um convite ou remove uma pessoa.
import { headers } from 'next/headers'
import { gravarSessao, quem } from '@/lib/auth'
import { emailValido, gerarHashSenha, normEmail, problemaSenha } from '@/lib/senhas'
import { buscarUsuario, cancelarConvite, conviteValido, criarConvite, emailAdmin, gravarUsuario, removerUsuario, usarConvite } from '@/lib/usuarios'

export const runtime = 'nodejs'
const nao = (msg: string, status = 400) => Response.json({ ok: false, msg }, { status })

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { token?: unknown; email?: string; senha?: string; repetir?: string; nota?: string; trocarSenhaDe?: string }

  // 1) administrador gera um link
  if (typeof b.token !== 'string' || !b.token) {
    if (b.token != null && typeof b.token !== 'string') return nao('Convite inválido.')
    const eu = await quem()
    if (eu?.papel !== 'admin') return nao('Só o administrador cria convites.', 403)
    const destino = b.trocarSenhaDe ? normEmail(b.trocarSenhaDe) : null
    if (destino && !(await buscarUsuario(destino))) return nao('Essa pessoa não tem acesso para trocar a senha.')
    const r = await criarConvite(eu.email, (b.nota ?? '').trim().slice(0, 80) || null, destino)
    if (!r.ok || !r.token) return nao('Não consegui criar o convite. Tente de novo.', 500)
    const h = await headers()
    const origem = `${h.get('x-forwarded-proto') || 'https'}://${h.get('x-forwarded-host') || h.get('host')}`
    return Response.json({ ok: true, link: `${origem}/painel/convite?t=${r.token}` })
  }

  // 2) convidada cria o acesso
  const c = await conviteValido(b.token)
  if (!c) return nao('Este link de convite não vale mais (já foi usado ou passou de 7 dias). Peça um novo.', 410)
  const email = normEmail(b.email ?? '')
  if (!emailValido(email)) return nao('Escreva um e-mail válido.')
  if (email === emailAdmin()) return nao('Este e-mail é do administrador. Use outro.')
  const p = problemaSenha(b.senha ?? '', b.repetir)
  if (p) return nao(p)
  const existe = await buscarUsuario(email)
  if (c.email_destino && c.email_destino !== email) return nao('Este link é para trocar a senha de outro e-mail.')
  if (existe?.papel === 'admin') return nao('Este e-mail é de um administrador. Use outro.')
  if (existe && !c.email_destino) return nao('Este e-mail já tem acesso. Entre com a sua senha; se esqueceu, peça ao administrador um link de troca de senha.')
  if (!(await usarConvite(b.token, email))) return nao('Este link de convite acabou de ser usado. Peça um novo.', 410)
  // link de troca de senha: grava a senha nova da mesma pessoa
  const r = await gravarUsuario({ email, papel: 'convidado', senha_hash: gerarHashSenha(b.senha ?? '') })
  if (!r.ok) return nao('O banco não respondeu. Tente de novo.', 500)
  await gravarSessao(email)
  return Response.json({ ok: true, trocouSenha: Boolean(existe) })
}

export async function DELETE(req: Request) {
  const eu = await quem()
  if (eu?.papel !== 'admin') return nao('Só o administrador.', 403)
  const b = (await req.json().catch(() => ({}))) as { convite?: string; email?: string }
  if (b.convite) return Response.json({ ok: await cancelarConvite(b.convite) })
  if (b.email) {
    if (normEmail(b.email) === eu.email) return nao('Você não pode remover o próprio acesso.')
    return Response.json({ ok: await removerUsuario(b.email) })
  }
  return nao('Nada para fazer.')
}
