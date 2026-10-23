// Menu e moldura de todas as abas. porta(aba) devolve o login (sem senha) ou null (pode mostrar a aba).
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { CLIENTE } from '@/cliente.config'
import { instalacaoConfigurada, quem } from '@/lib/auth'
import { bancoConfigurado, falhasDeLeitura } from '@/lib/db'
import { emDemo } from '@/lib/dados'
import Atualizar from './_ui/atualizar'
import Login from './_ui/login'
import Sair from './_ui/sair'
import TemaBotao, { type Tema } from './_ui/tema'

const ABAS: [key: string, label: string, href: string][] = [
  ['lucro', 'Lucro', '/painel'],
  ['anuncios', 'Anúncios · funil 3x', '/painel/anuncios'],
  ['pagina', 'Comportamento na página', '/painel/pagina'],
  ['recuperar', 'Recuperar vendas', '/painel/recuperar'],
  ['ajustes', 'Ajustes', '/painel/ajustes'],
  ['acessos', 'Acessos', '/painel/acessos'],
  ['fontes', 'Fontes de dados', '/painel/fontes'],
]

export async function porta() {
  if (!(await quem())) return <Login nome={CLIENTE.nome} configurada={instalacaoConfigurada()} demo={emDemo()} />
  return null
}

export async function Shell({ active, children }: { active: string; children: ReactNode }) {
  const salvo = (await cookies()).get('pl_tema')?.value
  const tema: Tema = salvo === 'claro' || salvo === 'escuro' ? salvo : 'auto'
  const falhas = falhasDeLeitura()
  const eu = await quem()
  const abas = ABAS.filter(([k]) => k !== 'acessos' || eu?.papel === 'admin')
  return (
    <div className="pn min-h-[100dvh] md:flex" data-tema={tema} style={{ background: 'var(--pale)' }}>
      <aside className="md:w-56 md:shrink-0 md:h-[100dvh] md:sticky md:top-0 md:overflow-y-auto z-20" style={{ background: 'var(--gd)', color: '#fff' }}>
        <a href="/painel" className="block px-5 pt-4 pb-3 font-display" style={{ fontWeight: 800, fontSize: 18, color: '#fff', textDecoration: 'none' }}>
          Painel de <span style={{ color: 'var(--o)' }}>Lucro</span>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{CLIENTE.nome}</div>
        </a>
        <div className="px-5 pb-3"><TemaBotao inicial={tema} /></div>
        {eu && <div className="px-5 pb-3" style={{ fontSize: 11.5, color: 'rgba(255,255,255,.65)', overflowWrap: 'anywhere' }}>{eu.email} · <Sair /></div>}
        <nav className="px-3 pb-3 flex md:block gap-1 overflow-x-auto">
          {abas.map(([k, l, h]) => (
            <a key={k} href={h} className="block rounded-lg px-3 py-2 whitespace-nowrap" style={{ fontSize: 13.5, fontWeight: 700, color: active === k ? '#000' : 'rgba(255,255,255,.85)', background: active === k ? 'var(--o)' : 'transparent', textDecoration: 'none' }}>{l}</a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6">
        <div className="mx-auto" style={{ maxWidth: 1240 }}>
          <div className="flex flex-wrap justify-end items-center gap-2 mb-3"><Atualizar geradoEm={new Date().toISOString()} /></div>
          {emDemo() && <div className="rounded-xl p-3 mb-4" style={{ fontSize: 13.5, background: 'rgba(28,135,60,.1)', border: '1px solid rgba(28,135,60,.35)' }}><strong>Demonstração:</strong> todos os números desta tela são fictícios.</div>}
          {!emDemo() && !bancoConfigurado() && <div className="rounded-xl p-3 mb-4" style={{ fontSize: 13.5, background: 'rgba(192,57,43,.08)', border: '1px solid rgba(192,57,43,.35)' }}><strong style={{ color: 'var(--pn-verm)' }}>Banco não configurado.</strong> Faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel.</div>}
          {falhas.length > 0 && <div role="alert" className="rounded-xl p-3 mb-4" style={{ fontSize: 13.5, lineHeight: 1.5, background: 'rgba(192,57,43,.08)', border: '1px solid rgba(192,57,43,.35)' }}><strong style={{ color: 'var(--pn-verm)' }}>Dados incompletos.</strong> O banco não respondeu ao ler {falhas.join(', ')}. Recarregue a página antes de decidir; se continuar, veja a aba Fontes.</div>}
          {children}
        </div>
      </main>
    </div>
  )
}
