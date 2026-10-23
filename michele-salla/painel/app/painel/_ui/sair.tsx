'use client'
// Botão "sair" do menu: apaga a sessão e volta para a tela de entrar.
export default function Sair() {
  return <button type="button" onClick={async () => { await fetch('/api/entrar', { method: 'DELETE' }).catch(() => {}); location.href = '/painel' }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.85)', textDecoration: 'underline', cursor: 'pointer', fontSize: 11.5, padding: 0 }}>sair</button>
}
