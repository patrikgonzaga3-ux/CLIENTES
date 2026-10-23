// Página do link de convite: a pessoa convidada cria o acesso dela (e-mail + senha). Não precisa estar logada.
import { CLIENTE } from '@/cliente.config'
import { conviteValido } from '@/lib/usuarios'
import CriarAcesso from './criar-acesso'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

export default async function Convite({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const t = Array.isArray(sp.t) ? sp.t[0] : sp.t
  const c = t && process.env.DEMO !== '1' ? await conviteValido(t) : null
  return <CriarAcesso nome={CLIENTE.nome} token={c ? (t as string) : null} emailFixo={c?.email_destino ?? null} />
}
