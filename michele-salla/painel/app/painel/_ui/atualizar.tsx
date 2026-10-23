'use client'
// Botão "Atualizar" do painel (topo de todas as abas): puxa o Meta e a planilha agora (/api/atualizar),
// depois busca de novo os números da aba no servidor (sem recarregar a página) e mostra a hora.
// Também atualiza sozinho quando a aba volta a aparecer (celular desbloqueado, volta de outro app
// ou página restaurada pelo Safari), se os números tiverem mais de 1 minuto. Sem isso o iPhone
// mostrava a página guardada com os números de horas atrás (Patrik, 15/10).
import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const VELHO_MS = 60_000

export default function Atualizar({ geradoEm }: { geradoEm: string }) {
  const router = useRouter()
  const [pendente, start] = useTransition()
  const [clicou, setClicou] = useState(false)
  const [fase, setFase] = useState<'' | 'meta'>('')
  const [aviso, setAviso] = useState('')
  const gerado = useRef(geradoEm)
  gerado.current = geradoEm

  useEffect(() => {
    const talvez = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - new Date(gerado.current).getTime() < VELHO_MS) return
      start(() => router.refresh())
    }
    const aoMostrar = (e: PageTransitionEvent) => { if (e.persisted) talvez() }
    document.addEventListener('visibilitychange', talvez)
    window.addEventListener('pageshow', aoMostrar)
    window.addEventListener('focus', talvez)
    return () => {
      document.removeEventListener('visibilitychange', talvez)
      window.removeEventListener('pageshow', aoMostrar)
      window.removeEventListener('focus', talvez)
    }
  }, [router])

  const atualizarTudo = async () => {
    setClicou(true); setAviso(''); setFase('meta')
    try {
      const r = await fetch('/api/atualizar', { method: 'POST' })
      const j = await r.json().catch(() => ({}))
      if (!j.ok) setAviso('o Meta ou a planilha não responderam agora; veja a aba Fontes')
    } catch { setAviso('o Meta ou a planilha não responderam agora; veja a aba Fontes') }
    setFase('')
    start(() => router.refresh())
  }

  const fmt = (o: Intl.DateTimeFormatOptions) => new Date(geradoEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', ...o })
  const hoje = fmt({ day: '2-digit', month: '2-digit' }) === new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' })
  const quando = hoje ? fmt({ hour: '2-digit', minute: '2-digit' }) : fmt({ day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  return (
    <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: 'var(--sub)' }}>
      <span>{fase === 'meta' ? 'puxando o Meta e a planilha (até 30 s)…' : pendente ? 'buscando números novos…' : aviso || `números de ${quando}`}</span>
      <button type="button" onClick={atualizarTudo} disabled={pendente || fase === 'meta'}
        style={{ minHeight: 38, padding: '7px 15px', borderRadius: 10, border: 'none', cursor: pendente || fase === 'meta' ? 'wait' : 'pointer', fontWeight: 800, fontSize: 13.5, background: 'var(--ink)', color: 'var(--pn-card, #fff)', opacity: pendente || fase === 'meta' ? 0.7 : 1 }}>
        {fase === 'meta' || (pendente && clicou) ? 'Atualizando…' : 'Atualizar'}
      </button>
    </div>
  )
}
