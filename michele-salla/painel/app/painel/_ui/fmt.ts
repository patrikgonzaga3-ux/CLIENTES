// Formatação (pt-BR) compartilhada pelo painel.
export const N = (v: unknown) => Number(v) || 0
export const div = (n: number, d: number) => (d > 0 ? n / d : 0)
export const brl = (n: number) =>
  'R$ ' + (Math.round(n * 100) / 100).toLocaleString('pt-BR', { minimumFractionDigits: Math.abs(n % 1) < 0.005 ? 0 : 2, maximumFractionDigits: 2 })
export const brl0 = (n: number) => (n < 0 ? '−R$ ' : 'R$ ') + Math.abs(Math.round(n)).toLocaleString('pt-BR')
export const int = (n: number) => Math.round(n).toLocaleString('pt-BR')
export const pct = (n: number, d: number, casas = 1) =>
  d > 0 ? (Math.round((n / d) * 100 * 10 ** casas) / 10 ** casas).toLocaleString('pt-BR') + '%' : '—'
export const pctv = (x: number | null | undefined, casas = 1) =>
  x == null || !isFinite(x) ? '—' : (Math.round(x * 100 * 10 ** casas) / 10 ** casas).toLocaleString('pt-BR') + '%'
export const num2 = (x: number | null | undefined) =>
  x == null || !isFinite(x) ? '—' : x.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const plural = (n: number, um: string, varios: string) => `${int(n)} ${n === 1 ? um : varios}`

const TZ = 'America/Sao_Paulo'
export const dataBR = (s?: string | null) => (s ? new Date(s).toLocaleDateString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit' }) : '—')
export const horaBR = (s?: string | null) =>
  s ? new Date(s).toLocaleString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '') : '—'
/** Dia (YYYY-MM-DD) no fuso de Brasília. */
export const diaBR = (s: string | number | Date) => new Date(s).toLocaleDateString('en-CA', { timeZone: TZ })

/** Telefone só com dígitos e DDI 55 (para wa.me). */
export const telWa = (t?: string | null) => {
  const d = String(t || '').replace(/\D/g, '')
  if (!d) return ''
  return d.length <= 11 ? '55' + d : d
}
/** Telefone mascarado para a tela: (11) 9••••-1234 */
export const telMask = (t?: string | null) => {
  const d = String(t || '').replace(/\D/g, '').slice(-11)
  if (d.length < 10) return '—'
  return `(${d.slice(0, 2)}) ${d.slice(2, 3)}••••-${d.slice(-4)}`
}
/** Telefone completo para a tela: (82) 98872-1234 */
export const telFmt = (t?: string | null) => {
  const d = String(t || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return d || '—'
}
export const primeiroNome = (n?: string | null) => {
  const p = String(n || '').trim().split(/\s+/)[0] || ''
  return p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : '—'
}
