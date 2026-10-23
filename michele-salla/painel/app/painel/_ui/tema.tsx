'use client'
// Botão de tema do painel: Auto (segue o aparelho) · Claro · Escuro. Grava o cookie pn_tema
// (1 ano) para o servidor já desenhar a página no tema certo, sem piscar branco.
import { useState } from 'react'

export type Tema = 'auto' | 'claro' | 'escuro'
const OPCOES: [Tema, string, string][] = [['auto', 'Auto', 'Segue o celular ou o computador'], ['claro', 'Claro', 'Tema claro'], ['escuro', 'Escuro', 'Tema escuro']]

export default function TemaBotao({ inicial }: { inicial: Tema }) {
  const [tema, setTema] = useState<Tema>(inicial)
  const escolhe = (t: Tema) => {
    setTema(t)
    document.cookie = `pl_tema=${t}; path=/; max-age=31536000; samesite=lax`
    document.querySelectorAll<HTMLElement>('.pn').forEach((el) => { el.dataset.tema = t })
  }
  return (
    <div role="radiogroup" aria-label="Tema do painel" style={{ display: 'inline-flex', gap: 2, padding: 3, borderRadius: 10, background: 'rgba(255,255,255,.1)' }}>
      {OPCOES.map(([t, rot, dica]) => (
        <button key={t} type="button" role="radio" aria-checked={tema === t} title={dica} onClick={() => escolhe(t)}
          style={{ fontSize: 11.5, fontWeight: 800, padding: '4px 9px', borderRadius: 8, border: 'none', cursor: 'pointer', background: tema === t ? '#fff' : 'transparent', color: tema === t ? '#0b2614' : 'rgba(255,255,255,.8)' }}>
          {rot}
        </button>
      ))}
    </div>
  )
}
