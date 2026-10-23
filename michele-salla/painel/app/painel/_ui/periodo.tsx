// Período do painel (fuso de Brasília, -03:00; o Brasil não tem mais horário de verão).
// Tudo ancora na MEIA-NOITE de Brasília: o gasto do Meta é por dia, então a receita
// também precisa começar no início do dia (senão o ROI sai menor do que é).
import { diaBR } from './fmt'

export type SP = { p?: string; de?: string; ate?: string; nivel?: string; ver?: string; orig?: string; sit?: string }

export type Periodo = {
  chave: string
  rotulo: string
  since: string // ISO com -03:00 (inclusive)
  until: string // ISO (exclusivo)
  diaIni: string // YYYY-MM-DD (inclusive)
  diaFim: string // YYYY-MM-DD (inclusive)
  dias: number // dias de calendário cobertos (parcial conta 1)
}

const DIA = 86_400_000
const hojeBR = () => diaBR(Date.now())
const somaDias = (dia: string, n: number) => diaBR(new Date(`${dia}T12:00:00-03:00`).getTime() + n * DIA)
const okDia = (d?: string) => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d)
const ini = (dia: string) => `${dia}T00:00:00-03:00`
const nDias = (a: string, b: string) => Math.round((new Date(`${b}T12:00:00Z`).getTime() - new Date(`${a}T12:00:00Z`).getTime()) / DIA) + 1

export const PRESETS: [string, string][] = [
  ['hoje', 'Hoje'],
  ['ontem', 'Ontem'],
  ['3d', '3 dias'],
  ['7d', '7 dias'],
  ['mes', 'Mês atual'],
  ['30d', '30 dias'],
]

export function periodo(sp: SP, padrao = 'mes'): Periodo {
  const h = hojeBR()
  const agora = new Date().toISOString()
  const c = sp.p || padrao
  const mk = (chave: string, rotulo: string, a: string, b: string, until: string): Periodo => ({ chave, rotulo, since: ini(a), until, diaIni: a, diaFim: b, dias: nDias(a, b) })
  if (c === 'datas' && (okDia(sp.de) || okDia(sp.ate))) {
    const a = okDia(sp.de) ? sp.de! : sp.ate!
    const b = okDia(sp.ate) ? sp.ate! : h
    const [x, y] = a <= b ? [a, b] : [b, a]
    return mk('datas', x === y ? `em ${x.split('-').reverse().slice(0, 2).join('/')}` : `de ${x.split('-').reverse().slice(0, 2).join('/')} a ${y.split('-').reverse().slice(0, 2).join('/')}`, x, y, y >= h ? agora : ini(somaDias(y, 1)))
  }
  if (c === 'hoje') return mk('hoje', 'hoje', h, h, agora)
  if (c === 'ontem') { const o = somaDias(h, -1); return mk('ontem', 'ontem', o, o, ini(h)) }
  if (c === '3d') return mk('3d', 'últimos 3 dias (com hoje)', somaDias(h, -2), h, agora)
  if (c === '7d') return mk('7d', 'últimos 7 dias (com hoje)', somaDias(h, -6), h, agora)
  if (c === '30d') return mk('30d', 'últimos 30 dias (com hoje)', somaDias(h, -29), h, agora)
  if (c === 'tudo') return mk('tudo', 'todo o período', '2026-06-01', h, agora)
  return mk('mes', 'mês atual', `${h.slice(0, 7)}-01`, h, agora)
}

/** Janela de N dias terminando hoje (com hoje). */
export const ultimosDias = (n: number): Periodo => {
  const h = hojeBR()
  const a = somaDias(h, -(n - 1))
  return { chave: `${n}d`, rotulo: `últimos ${n} dias`, since: ini(a), until: new Date().toISOString(), diaIni: a, diaFim: h, dias: n }
}
export const diaHoje = hojeBR
export { somaDias }

/** Períodos que o botão WhatsApp oferece em toda aba com filtro de dia (além dos presets da própria aba). */
export const REL_PADRAO: [string, string][] = [['hoje', 'Hoje'], ['ontem', 'Ontem'], ['7d', '7 dias'], ['mes', 'Mês atual']]
export const relOpcoes = (presets: [string, string][], padrao: [string, string][] | false = REL_PADRAO) => {
  const m = new Map<string, string>(padrao || [])
  for (const [k, l] of presets) if (!m.has(k)) m.set(k, l)
  return JSON.stringify([...m])
}

/** relPadrao=false: a aba só aceita os próprios presets (ex.: Comparar meses). */
export function FiltroPeriodo({ per, presets = PRESETS, extra, base = '', relPadrao = true }: { per: Periodo; presets?: [string, string][]; extra?: Record<string, string | undefined>; base?: string; relPadrao?: boolean }) {
  const keep = Object.entries(extra || {}).filter(([, v]) => v) as [string, string][]
  const href = (p: string) => base + '?' + new URLSearchParams([['p', p], ...keep]).toString()
  const pill = (on: boolean): React.CSSProperties => ({
    padding: '7px 13px', borderRadius: 99, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-block',
    border: on ? '1px solid var(--o)' : '1px solid rgb(var(--pn-rgb) / .12)', background: on ? 'var(--o)' : 'var(--pn-card)', color: on ? '#fff' : 'var(--ink)',
  })
  const inp: React.CSSProperties = { padding: '6px 9px', borderRadius: 10, border: '1px solid rgb(var(--pn-rgb) / .14)', fontSize: 13, background: 'var(--pn-card)', color: 'var(--ink)' }
  return (
    <div className="rounded-2xl p-3 mb-5" style={{ background: 'var(--pn-card)', border: '1px solid rgb(var(--pn-rgb) / .07)' }}>
      <div className="flex flex-wrap items-center gap-2">
        {presets.map(([k, l]) => <a key={k} href={href(k)} style={pill(per.chave === k)}>{l}</a>)}
        <form method="get" className="flex flex-wrap items-center gap-2" style={{ marginLeft: 'auto' }}>
          <input type="hidden" name="p" value="datas" />
          {keep.map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <input type="date" name="de" defaultValue={per.chave === 'datas' ? per.diaIni : ''} aria-label="De" style={inp} />
          <span style={{ color: 'var(--mute)', fontSize: 13 }}>até</span>
          <input type="date" name="ate" defaultValue={per.chave === 'datas' ? per.diaFim : ''} aria-label="Até" style={inp} />
          <button type="submit" style={{ ...pill(per.chave === 'datas'), cursor: 'pointer' }}>Aplicar</button>
        </form>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--mute)', marginTop: 8 }} data-rel-periodo="" data-rel-param="p" data-rel-chave={per.chave} data-rel-de={per.diaIni} data-rel-ate={per.diaFim} data-rel-hoje={hojeBR()} data-rel-opcoes={relOpcoes(presets, relPadrao ? REL_PADRAO : false)}>Mostrando <strong style={{ color: 'var(--ink)' }}>{per.rotulo}</strong> · horário de Brasília</div>
    </div>
  )
}
