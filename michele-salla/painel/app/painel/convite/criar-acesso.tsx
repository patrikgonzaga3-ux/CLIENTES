'use client'
// Formulário do convite: e-mail + senha (2x). Com link de troca de senha, o e-mail já vem preenchido.
import { useState } from 'react'

const campo: React.CSSProperties = { padding: '14px 16px', fontSize: 16, border: '2px solid rgba(0,0,0,.12)', background: '#F7F5F2', color: '#1a1a1a', width: '100%', borderRadius: 12, outline: 'none', marginTop: 10 }

export default function CriarAcesso({ nome, token, emailFixo }: { nome: string; token: string | null; emailFixo: string | null }) {
  const [email, setEmail] = useState(emailFixo ?? '')
  const [senha, setSenha] = useState('')
  const [repetir, setRepetir] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function criar(e: React.FormEvent) {
    e.preventDefault(); setErro(''); setCarregando(true)
    try {
      const r = await fetch('/api/convite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, email, senha, repetir }) })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; msg?: string }
      if (r.ok && j.ok) { location.href = '/painel'; return }
      setErro(j.msg || 'Não deu certo. Tente de novo.')
    } catch { setErro('Erro de conexão. Tente de novo.') } finally { setCarregando(false) }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-5" style={{ background: 'var(--gd)' }}>
      <form onSubmit={criar} className="w-full" style={{ maxWidth: 400 }}>
        <div className="rounded-3xl p-7" style={{ background: '#fff', boxShadow: '0 24px 60px rgba(0,0,0,.3)' }}>
          <div className="font-display text-center" style={{ fontWeight: 800, fontSize: 22, color: '#1a1a1a' }}>Painel de <span style={{ color: 'var(--o)' }}>Lucro</span></div>
          <p className="text-center" style={{ fontSize: 13.5, color: '#555', margin: '6px 0 16px' }}>{nome} · {emailFixo ? 'troca de senha' : 'convite'}</p>
          {!token ? (
            <p className="rounded-xl p-3" style={{ fontSize: 13.5, background: 'rgba(197,57,0,.08)', color: '#c0392b', lineHeight: 1.5 }}>
              Este link não vale mais: já foi usado ou passou de 7 dias. Peça um novo ao administrador.
              <br /><a href="/painel" style={{ color: '#c0392b', fontWeight: 700 }}>Já tenho acesso: entrar</a>
            </p>
          ) : (
            <>
              <p style={{ fontSize: 13.5, color: '#333', lineHeight: 1.5 }}>{emailFixo ? 'Crie a sua senha nova.' : 'Crie o seu acesso: o seu e-mail e uma senha só sua (8 caracteres ou mais).'}</p>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu e-mail" autoComplete="username" readOnly={Boolean(emailFixo)} style={{ ...campo, opacity: emailFixo ? 0.7 : 1 }} />
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Crie uma senha" autoComplete="new-password" style={campo} />
              <input type="password" value={repetir} onChange={(e) => setRepetir(e.target.value)} placeholder="Repita a senha" autoComplete="new-password" style={campo} />
              {erro && <p role="alert" style={{ fontSize: 13, color: '#c0392b', marginTop: 8, lineHeight: 1.45 }}>{erro}</p>}
              <button type="submit" disabled={carregando || !email || !senha || !repetir} className="font-display w-full rounded-full mt-4" style={{ padding: 15, fontSize: 16, fontWeight: 800, color: '#000', background: carregando || !email || !senha || !repetir ? 'rgba(0,0,0,.18)' : 'var(--o)', border: 'none', cursor: 'pointer' }}>
                {carregando ? 'Criando…' : emailFixo ? 'Salvar senha e entrar' : 'Criar acesso e entrar'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
