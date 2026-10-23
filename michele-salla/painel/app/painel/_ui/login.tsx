'use client'
// Tela de entrar: e-mail + senha de cada pessoa. O administrador cria (ou troca) a senha com o código de instalação.
import { useState } from 'react'

const campo: React.CSSProperties = { padding: '14px 16px', fontSize: 16, border: '2px solid rgba(0,0,0,.12)', background: '#F7F5F2', color: '#1a1a1a', width: '100%', borderRadius: 12, outline: 'none', marginTop: 10 }

export default function Login({ nome, configurada, demo }: { nome: string; configurada: boolean; demo: boolean }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState(demo ? 'demo' : '')
  const [repetir, setRepetir] = useState('')
  const [instalacao, setInstalacao] = useState('')
  const [modoAdmin, setModoAdmin] = useState(false) // criar/trocar a senha do administrador
  const [esqueci, setEsqueci] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(e: React.FormEvent) {
    e.preventDefault(); setErro(''); setCarregando(true)
    try {
      const r = await fetch('/api/entrar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha, ...(modoAdmin ? { instalacao, repetir } : {}) }) })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; msg?: string; primeiroAcesso?: boolean }
      if (r.ok && j.ok) { location.reload(); return }
      if (j.primeiroAcesso && !modoAdmin) { setModoAdmin(true); setSenha(''); setErro('Primeiro acesso do administrador: crie sua senha abaixo.') }
      else setErro(j.msg || 'Não deu certo. Tente de novo.')
    } catch { setErro('Erro ao entrar. Tente de novo.') } finally { setCarregando(false) }
  }
  const pronto = demo ? Boolean(senha) : Boolean(email && senha && (!modoAdmin || (instalacao && repetir)))

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-5" style={{ background: 'var(--gd)' }}>
      <form onSubmit={entrar} className="w-full" style={{ maxWidth: 400 }}>
        <div className="rounded-3xl p-7" style={{ background: '#fff', boxShadow: '0 24px 60px rgba(0,0,0,.3)' }}>
          <div className="font-display text-center" style={{ fontWeight: 800, fontSize: 22, color: '#1a1a1a' }}>Painel de <span style={{ color: 'var(--o)' }}>Lucro</span></div>
          <p className="text-center" style={{ fontSize: 13.5, color: '#555', margin: '6px 0 16px' }}>{nome} · área restrita</p>
          {!configurada && <p className="rounded-xl p-3 mb-3" style={{ fontSize: 12.5, background: 'rgba(197,57,0,.08)', color: '#c0392b', lineHeight: 1.5 }}>Falta a variável PAINEL_SENHA (código de instalação) na Vercel.</p>}
          {demo && <p className="rounded-xl p-3 mb-3" style={{ fontSize: 12.5, background: 'rgba(28,135,60,.08)', color: '#1C873C', lineHeight: 1.5 }}>Demonstração com dados fictícios: senha <strong>demo</strong>.</p>}
          {!demo && <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu e-mail" autoComplete="username" autoFocus style={campo} />}
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder={modoAdmin ? 'Senha nova (8 ou mais)' : 'Senha'} autoComplete={modoAdmin ? 'new-password' : 'current-password'} style={campo} />
          {modoAdmin && <>
            <input type="password" value={repetir} onChange={(e) => setRepetir(e.target.value)} placeholder="Repita a senha nova" autoComplete="new-password" style={campo} />
            <input type="password" value={instalacao} onChange={(e) => setInstalacao(e.target.value)} placeholder="Código de instalação (PAINEL_SENHA da Vercel)" autoComplete="off" style={campo} />
          </>}
          {erro && <p role="alert" style={{ fontSize: 13, color: '#c0392b', marginTop: 8, lineHeight: 1.45 }}>{erro}</p>}
          <button type="submit" disabled={carregando || !pronto} className="font-display w-full rounded-full mt-4" style={{ padding: 15, fontSize: 16, fontWeight: 800, color: '#000', background: carregando || !pronto ? 'rgba(0,0,0,.18)' : 'var(--o)', border: 'none', cursor: 'pointer' }}>
            {carregando ? 'Entrando…' : modoAdmin ? 'Salvar senha e entrar' : 'Entrar'}
          </button>
          {!demo && (
            <div style={{ marginTop: 14, fontSize: 12.5, color: '#666', lineHeight: 1.5, textAlign: 'center' }}>
              {!esqueci ? <button type="button" onClick={() => setEsqueci(true)} style={{ background: 'none', border: 'none', color: '#555', textDecoration: 'underline', cursor: 'pointer', fontSize: 12.5 }}>Esqueci minha senha</button>
                : <>Peça ao administrador um link de troca de senha.<br />
                  {!modoAdmin && <button type="button" onClick={() => { setModoAdmin(true); setErro('') }} style={{ background: 'none', border: 'none', color: '#555', textDecoration: 'underline', cursor: 'pointer', fontSize: 12.5, marginTop: 4 }}>Sou o administrador</button>}</>}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
