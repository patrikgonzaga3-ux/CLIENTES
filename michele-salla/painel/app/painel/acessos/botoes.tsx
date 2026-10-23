'use client'
// Botões da aba Acessos (chamam /api/convite).
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const bt = (cor = 'var(--o)', txt = '#000'): React.CSSProperties => ({ padding: '8px 14px', fontSize: 13.5, fontWeight: 800, borderRadius: 99, border: 'none', background: cor, color: txt, cursor: 'pointer', whiteSpace: 'nowrap' })
const campo: React.CSSProperties = { padding: '9px 11px', fontSize: 16, borderRadius: 10, border: '1px solid rgb(var(--pn-rgb) / .18)', background: 'var(--pn-card)', color: 'var(--ink)', minWidth: 0, flex: '1 1 200px' }

async function chama(metodo: 'POST' | 'DELETE', corpo: object) {
  const r = await fetch('/api/convite', { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) })
  return (await r.json().catch(() => ({}))) as { ok?: boolean; msg?: string; link?: string }
}

function LinkPronto({ link, texto }: { link: string; texto: string }) {
  const [copiou, setCopiou] = useState(false)
  return (
    <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(28,135,60,.08)', border: '1px solid rgba(28,135,60,.3)', fontSize: 13.5, lineHeight: 1.5 }}>
      <strong>{texto}</strong> Copie agora: ele não aparece de novo.
      <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: 12.5, margin: '6px 0' }}>{link}</div>
      <button type="button" style={bt('var(--g)', '#fff')} onClick={async () => { await navigator.clipboard.writeText(link).catch(() => {}); setCopiou(true) }}>{copiou ? 'Copiado ✓' : 'Copiar link'}</button>
    </div>
  )
}

export function BotaoConvite() {
  const router = useRouter()
  const [nota, setNota] = useState('')
  const [link, setLink] = useState('')
  const [erro, setErro] = useState('')
  const [indo, setIndo] = useState(false)
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--pn-card)', border: '1px solid rgb(var(--pn-rgb) / .08)' }}>
      <div className="flex flex-wrap gap-2 items-center">
        <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Para quem? (ex.: Michele) · opcional" style={campo} />
        <button type="button" disabled={indo} style={bt()} onClick={async () => {
          setIndo(true); setErro(''); setLink('')
          const j = await chama('POST', { nota })
          setIndo(false)
          if (j.ok && j.link) { setLink(j.link); setNota(''); router.refresh() } else setErro(j.msg || 'Não deu certo.')
        }}>{indo ? 'Gerando…' : 'Gerar link de convite'}</button>
      </div>
      {erro && <p role="alert" style={{ color: 'var(--pn-verm)', fontSize: 13, marginTop: 8 }}>{erro}</p>}
      {link && <LinkPronto link={link} texto="Link de convite pronto." />}
    </div>
  )
}

export function BotaoTrocarSenha({ email }: { email: string }) {
  const [link, setLink] = useState('')
  const [erro, setErro] = useState('')
  return (
    <span style={{ display: 'inline-block', textAlign: 'left' }}>
      <button type="button" style={bt('rgb(var(--pn-rgb) / .08)', 'var(--ink)')} onClick={async () => {
        setErro(''); const j = await chama('POST', { trocarSenhaDe: email, nota: 'troca de senha' })
        if (j.ok && j.link) setLink(j.link); else setErro(j.msg || 'Não deu certo.')
      }}>Link de nova senha</button>
      {erro && <div style={{ color: 'var(--pn-verm)', fontSize: 12 }}>{erro}</div>}
      {link && <div style={{ whiteSpace: 'normal', maxWidth: 360 }}><LinkPronto link={link} texto={`Link para ${email} criar uma senha nova.`} /></div>}
    </span>
  )
}

export function BotaoRemover({ email }: { email: string }) {
  const router = useRouter()
  return <button type="button" style={bt('rgba(192,57,43,.12)', 'var(--pn-verm)')} onClick={async () => {
    if (!confirm(`Tirar o acesso de ${email}?`)) return
    const j = await chama('DELETE', { email }); if (!j.ok) alert(j.msg || 'Não deu certo.'); router.refresh()
  }}>Remover</button>
}

export function BotaoCancelar({ id }: { id: string }) {
  const router = useRouter()
  return <button type="button" style={bt('rgb(var(--pn-rgb) / .08)', 'var(--ink)')} onClick={async () => {
    const j = await chama('DELETE', { convite: id }); if (!j.ok) alert(j.msg || 'Não deu certo.'); router.refresh()
  }}>Cancelar</button>
}
