// Peças visuais compartilhadas do painel (server components, sem JS no cliente).
import type { ReactNode, CSSProperties } from 'react'

export const COR = { ok: 'var(--g)', wait: 'var(--pn-amar)', no: 'var(--pn-verm)', n: 'var(--mute)' } as const

export function Titulo({ titulo, sub, children }: { titulo: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div style={{ flex: '1 1 320px', minWidth: 0 }}>
        <h1 className="font-display" style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.15 }}>{titulo}</h1>
        {sub && <p style={{ fontSize: 13.5, color: 'var(--sub)', marginTop: 4, lineHeight: 1.5 }}>{sub}</p>}
      </div>
      {children}
    </div>
  )
}

/** Cartão de número. `icone` põe o selo colorido à direita do rótulo; `delta` vai ao lado do número (ex.: <Delta />). */
export function Tile({ label, value, sub, cor, destaque, delta }: { label: string; value: ReactNode; sub?: ReactNode; cor?: string; destaque?: boolean; delta?: ReactNode }) {
  const icone = false
  return (
    <div data-rel-card="" className="rounded-2xl p-4" style={{ background: destaque ? 'var(--gd)' : 'var(--pn-card)', color: destaque ? '#fff' : undefined, border: '1px solid rgb(var(--pn-rgb) / .07)', boxShadow: '0 4px 16px rgba(0,0,0,.04)', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: destaque ? 'rgba(255,255,255,.65)' : 'var(--mute)', paddingTop: icone ? 2 : 0 }} data-rel-l="">{label}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 8, rowGap: 2, marginTop: icone ? 0 : 4 }}>
        <div className="font-display" style={{ fontSize: 26, fontWeight: 800, color: destaque ? '#fff' : cor || 'var(--ink)', lineHeight: 1.15, overflowWrap: 'anywhere' }} data-rel-v="">{value}</div>
        {delta}
      </div>
      {sub && <div style={{ fontSize: 12.5, color: destaque ? 'rgba(255,255,255,.75)' : 'var(--sub)', marginTop: 3, lineHeight: 1.4 }} data-rel-s="">{sub}</div>}
    </div>
  )
}

export function Grade({ children, min = 170 }: { children: ReactNode; min?: number }) {
  return <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))` }}>{children}</div>
}

export function Secao({ titulo, sub, children, id }: { titulo: string; sub?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section className="mt-7" id={id}>
      <h2 className="font-display" style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{titulo}</h2>
      {sub && <p style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 3, lineHeight: 1.5 }}>{sub}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function Caixa({ children, tom = 'info' }: { children: ReactNode; tom?: 'info' | 'alerta' | 'ok' | 'erro' }) {
  const bg = { info: 'rgba(245,113,0,.07)', alerta: 'rgba(185,119,14,.10)', ok: 'rgba(28,135,60,.08)', erro: 'rgba(192,57,43,.08)' }[tom]
  const bd = { info: 'rgba(245,113,0,.2)', alerta: 'rgba(185,119,14,.3)', ok: 'rgba(28,135,60,.25)', erro: 'rgba(192,57,43,.25)' }[tom]
  // minWidth 0: dentro de um grid, sem isso uma tabela larga estica a caixa e a página passa da tela no celular.
  return <div className="rounded-xl p-3" style={{ fontSize: 13, background: bg, border: `1px solid ${bd}`, color: 'var(--ink)', lineHeight: 1.55, minWidth: 0 }}>{children}</div>
}

export function Pill({ tipo, children, title }: { tipo: keyof typeof COR; children: ReactNode; title?: string }) {
  return <span title={title} style={{ display: 'inline-block', fontSize: 12, fontWeight: 800, padding: '3px 9px', borderRadius: 99, color: '#fff', background: COR[tipo], whiteSpace: 'nowrap' }}>{children}</span>
}

export function Barra({ valor, marca, cor = 'var(--g)', altura = 12 }: { valor: number; marca?: number; cor?: string; altura?: number }) {
  const v = Math.max(0, Math.min(1, valor))
  return (
    <div style={{ position: 'relative', height: altura, borderRadius: 99, background: 'rgb(var(--pn-rgb) / .08)', overflow: 'visible' }}>
      <div style={{ width: `${v * 100}%`, height: '100%', borderRadius: 99, background: cor }} />
      {marca != null && <div title="onde deveria estar hoje" style={{ position: 'absolute', top: -4, bottom: -4, left: `${Math.max(0, Math.min(1, marca)) * 100}%`, width: 2, background: 'var(--ink)' }} />}
    </div>
  )
}

export const th: CSSProperties = { padding: '9px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--mute)', textAlign: 'right', whiteSpace: 'nowrap', borderBottom: '1px solid rgb(var(--pn-rgb) / .08)' }
export const thL: CSSProperties = { ...th, textAlign: 'left' }
export const td: CSSProperties = { padding: '9px 10px', fontSize: 13.5, color: 'var(--ink)', textAlign: 'right', whiteSpace: 'nowrap', borderTop: '1px solid rgb(var(--pn-rgb) / .05)' }
export const tdL: CSSProperties = { ...td, textAlign: 'left', whiteSpace: 'normal' }

/** Tabela. Com `rel`, entra no relatório do WhatsApp: as primeiras `relMax` linhas viram "coluna 1: cabeçalho valor · …". */
// 19/10 (celular): no celular a 1ª coluna fica fixa ao arrastar e com largura mínima (globals.css, .pn-tab), e aparece
// o aviso "arraste para o lado" quando a tabela é mais larga que a tela.
export function Tabela({ children, min = 560, rel, relMax }: { children: ReactNode; min?: number; rel?: string; relMax?: number }) {
  return (
    <div className="pn-tab">
      <div className="rounded-2xl overflow-x-auto" data-rel-tab={rel} data-rel-max={rel && relMax ? String(relMax) : undefined} style={{ background: 'var(--pn-card)', border: '1px solid rgb(var(--pn-rgb) / .07)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: min }}>{children}</table>
      </div>
      {min > 400 && <div className="pn-arraste" aria-hidden>arraste a tabela para o lado →</div>}
    </div>
  )
}

export type Decisao = { tipo: 'ok' | 'wait' | 'no' | 'n'; txt: string }
const ICONE_DECISAO = { ok: '✅', wait: '⏳', no: '🚨', n: 'ℹ️' } as const
/** Bloco "Para decidir": o que os números da aba pedem agora. Cada linha também abre o relatório do WhatsApp (data-rel-acao). */
export function ParaDecidir({ itens, sub }: { itens: Decisao[]; sub?: ReactNode }) {
  if (!itens.length) return null
  return (
    <section className="mt-2 mb-5 rounded-2xl p-4" data-rel-ignora="" style={{ background: 'var(--pn-card)', border: '1px solid rgb(var(--pn-rgb) / .1)' }}>
      <h2 className="font-display" style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>Para decidir</h2>
      {sub && <p style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 2, lineHeight: 1.5 }}>{sub}</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'grid', gap: 6 }}>
        {itens.map((d, i) => (
          <li key={i} data-rel-acao="" data-rel-txt={`${ICONE_DECISAO[d.tipo]} ${d.txt}`} style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink)', display: 'flex', gap: 8 }}>
            <span aria-hidden>{ICONE_DECISAO[d.tipo]}</span><span>{d.txt}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Linhas que só vão para o relatório do WhatsApp (não aparecem na tela). */
export function RelLinhas({ sec, linhas }: { sec: string; linhas: string[] }) {
  return <div data-rel-sec={sec} style={{ display: 'none' }}>{linhas.map((l, i) => <span key={i} data-rel-item="" data-rel-txt={l} />)}</div>
}

export function Vazio({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl p-5" style={{ background: 'var(--pn-card)', border: '1px dashed rgb(var(--pn-rgb) / .15)', fontSize: 13.5, color: 'var(--sub)' }}>{children}</div>
}

export function Abas({ itens, ativo }: { itens: [string, string, string][]; ativo: string }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {itens.map(([k, rot, href]) => (
        <a key={k} href={href} style={{ padding: '6px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', border: '1px solid rgb(var(--pn-rgb) / .12)', background: ativo === k ? 'var(--ink)' : 'var(--pn-card)', color: ativo === k ? 'var(--pn-card)' : 'var(--ink)' }}>{rot}</a>
      ))}
    </div>
  )
}
