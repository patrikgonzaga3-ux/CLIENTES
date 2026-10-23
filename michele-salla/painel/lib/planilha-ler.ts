// Leitura das abas da planilha de gastos (sem imports: roda no robô e nos testes).
// Aba "Gastos": Mês | Grupo | Descrição | Tipo | Valor | Recorrente. Aba "Configuração": Item | Valor.
import type { Gasto } from './lucro'

type Celula = string

/** Converte número escrito do jeito brasileiro ("R$ 1.500,50", "12,5%", "1500.5") em número. */
export function numeroBR(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  let s = String(v ?? '').replace(/R\$|%|\s/gi, '').trim()
  if (!s) return null
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/** CSV simples (aspas, vírgula ou ponto e vírgula). */
export function lerCSV(txt: string): Celula[][] {
  const sep = (txt.split('\n')[0].match(/;/g)?.length ?? 0) > (txt.split('\n')[0].match(/,/g)?.length ?? 0) ? ';' : ','
  const linhas: Celula[][] = []
  let campo = '', linha: Celula[] = [], aspas = false
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i]
    if (aspas) { if (c === '"' && txt[i + 1] === '"') { campo += '"'; i++ } else if (c === '"') aspas = false; else campo += c; continue }
    if (c === '"') aspas = true
    else if (c === sep) { linha.push(campo); campo = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && txt[i + 1] === '\n') i++; linha.push(campo); linhas.push(linha); linha = []; campo = '' }
    else campo += c
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha) }
  return linhas.filter((l) => l.some((x) => x.trim()))
}

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

/** Linhas da aba Gastos → gastos. Cabeçalho: Mês | Grupo | Descrição | Tipo | Valor | Recorrente. */
export function gastosDaAba(linhas: Celula[][]): { gastos: (Gasto & { id: string })[]; avisos: string[] } {
  const avisos: string[] = []
  if (!linhas.length) return { gastos: [], avisos: ['aba Gastos vazia'] }
  const cab = linhas[0].map(norm)
  const col = (...n: string[]) => cab.findIndex((c) => n.some((x) => c.startsWith(x)))
  const [cM, cG, cD, cT, cV, cR] = [col('mes'), col('grupo'), col('descri'), col('tipo'), col('valor'), col('recorr')]
  if ([cM, cD, cT, cV].some((x) => x < 0)) return { gastos: [], avisos: ['cabeçalho da aba Gastos fora do modelo (Mês, Grupo, Descrição, Tipo, Valor, Recorrente)'] }
  const gastos: (Gasto & { id: string })[] = []
  linhas.slice(1).forEach((l, i) => {
    const n = i + 2
    const mesTxt = (l[cM] ?? '').trim()
    if (!mesTxt && !(l[cD] ?? '').trim()) return
    // aceita 2026-11, 11/2026, 11-2026, nov/2026
    let mes = ''
    const m1 = mesTxt.match(/^(\d{4})-(\d{1,2})/), m2 = mesTxt.match(/^(\d{1,2})[/-](\d{4})$/)
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    const m3 = norm(mesTxt).match(/^([a-z]{3})[a-z]*[/ -](\d{4})$/)
    if (m1) mes = `${m1[1]}-${m1[2].padStart(2, '0')}`
    else if (m2) mes = `${m2[2]}-${m2[1].padStart(2, '0')}`
    else if (m3 && meses.indexOf(m3[1]) >= 0) mes = `${m3[2]}-${String(meses.indexOf(m3[1]) + 1).padStart(2, '0')}`
    const valor = numeroBR(l[cV])
    const tipoTxt = norm(l[cT] ?? '')
    const tipo: Gasto['tipo'] | null = tipoTxt.startsWith('fix') ? 'fixo' : tipoTxt.includes('%') || tipoTxt.startsWith('perc') || tipoTxt.startsWith('var') ? '%' : null
    if (!mes || valor == null || !tipo) { avisos.push(`linha ${n} da aba Gastos ignorada (mês, tipo ou valor fora do padrão)`); return }
    gastos.push({ id: `gastos-${n}`, mes, grupo: (cG >= 0 ? l[cG] : '')?.trim() || 'Outros', descricao: (l[cD] ?? '').trim() || `linha ${n}`, tipo, valor, recorrente: cR >= 0 && ['sim', 's', 'x', 'true', '1'].includes(norm(l[cR] ?? '')) })
  })
  return { gastos, avisos }
}

/** Aba Configuração (Item | Valor) → chaves conhecidas. */
export function configDaAba(linhas: Celula[][]): Record<string, string> {
  const out: Record<string, string> = {}
  const mapa: [string, string][] = [['meta de lucro', 'meta_lucro'], ['imposto do meta', 'imposto_meta_pct'], ['taxa do gateway', 'taxa_gateway_pct'], ['ticket', 'ticket'], ['funil 3x', 'funil3x'], ['metas do funil', 'funil3x'], ['whatsapp', 'whatsapp']]
  for (const l of linhas) {
    const item = norm(l[0] ?? ''), valor = (l[1] ?? '').trim()
    const k = mapa.find(([p]) => item.startsWith(p))?.[1]
    if (k && valor) out[k] = valor
  }
  return out
}

