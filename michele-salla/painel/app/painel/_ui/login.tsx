'use client'
import { useState } from 'react'

export default function Login({ nome, configurada, demo }: { nome: string; configurada: boolean; demo: boolean }) {
  const [senha, setSenha] = useState(demo ? 'demo' : '')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  async function entrar(e: React.FormEvent) {
    e.preventDefault(); setErro(''); setCarregando(true)
    try {
      const r = await fetch('/api/entrar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senha }) })
      if (r.ok) location.reload(); else setErro('Senha incorreta.')
    } catch { setErro('Erro ao entrar. Tente de novo.') } finally { setCarregando(false) }
  }
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-5" style={{ background: 'var(--gd)' }}>
      <form onSubmit={entrar} className="w-full" style={{ maxWidth: 380 }}>
        <div className="rounded-3xl p-7" style={{ background: '#fff', boxShadow: '0 24px 60px rgba(0,0,0,.3)' }}>
          <div className="font-display text-center" style={{ fontWeight: 800, fontSize: 22, color: '#1a1a1a' }}>Painel de <span style={{ color: 'var(--o)' }}>Lucro</span></div>
          <p className="text-center" style={{ fontSize: 13.5, color: '#555', margin: '6px 0 20px' }}>{nome} · área restrita</p>
          {!configurada && <p className="rounded-xl p-3 mb-4" style={{ fontSize: 12.5, background: 'rgba(197,57,0,.08)', color: '#c0392b', lineHeight: 1.5 }}>Falta a variável PAINEL_SENHA na Vercel.</p>}
          {demo && <p className="rounded-xl p-3 mb-4" style={{ fontSize: 12.5, background: 'rgba(28,135,60,.08)', color: '#1C873C', lineHeight: 1.5 }}>Demonstração com dados fictícios: senha <strong>demo</strong>.</p>}
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha" autoFocus className="w-full rounded-xl outline-none" style={{ padding: '14px 16px', fontSize: 16, border: '2px solid rgba(0,0,0,.12)', background: '#F7F5F2', color: '#1a1a1a' }} />
          {erro && <p style={{ fontSize: 13, color: '#c0392b', marginTop: 8 }}>{erro}</p>}
          <button type="submit" disabled={carregando || !senha} className="font-display w-full rounded-full mt-4" style={{ padding: 15, fontSize: 16, fontWeight: 800, color: '#000', background: carregando || !senha ? 'rgba(0,0,0,.18)' : 'var(--o)', border: 'none', cursor: 'pointer' }}>{carregando ? 'Entrando…' : 'Entrar'}</button>
        </div>
      </form>
    </div>
  )
}
