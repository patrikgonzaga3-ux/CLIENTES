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

/** Mês escrito de vários jeitos (2026-11, 11/2026, 11-2026, nov/2026) → "AAAA-MM", ou "" se não entender. */
export function mesDeTexto(txt: string): string {
  const t = (txt ?? '').trim()
  const m1 = t.match(/^(\d{4})-(\d{1,2})$/) || t.match(/^(\d{4})-(\d{1,2})-\d{1,2}/), m2 = t.match(/^(\d{1,2})[/-](\d{4})$/)
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const m3 = norm(t).match(/^([a-z]{3})[a-z]*[/ -](\d{4})$/)
  let a = 0, m = 0
  if (m1) { a = Number(m1[1]); m = Number(m1[2]) }
  else if (m2) { a = Number(m2[2]); m = Number(m2[1]) }
  else if (m3 && meses.indexOf(m3[1]) >= 0) { a = Number(m3[2]); m = meses.indexOf(m3[1]) + 1 }
  if (!a || m < 1 || m > 12) return ''
  return `${a}-${String(m).padStart(2, '0')}`
}

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
    const mes = mesDeTexto(mesTxt)
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


// ── Ajustes feitos no próprio painel (aba Ajustes) ─────────────────────────────────────────
// O que foi escrito no painel vale mais que a planilha, que vale mais que o cliente.config.ts.

export type ItemAjuste = { chave: string; rotulo: string; dica: string; tipo: 'reais' | 'pct' | 'funil' | 'texto' }
export const ITENS_AJUSTE: ItemAjuste[] = [
  { chave: 'meta_lucro', rotulo: 'Meta de lucro do mês (R$)', dica: 'Quanto a cliente quer de lucro no mês. 0 = sem meta.', tipo: 'reais' },
  { chave: 'ticket', rotulo: 'Ticket do produto principal (R$)', dica: 'Preço base das metas do funil 3x.', tipo: 'reais' },
  { chave: 'funil3x', rotulo: 'Metas do funil 3x (% do ticket)', dica: 'Clique / initiate checkout / compra. Ex.: 4 / 23 / 45.', tipo: 'funil' },
  { chave: 'imposto_meta_pct', rotulo: 'Imposto do Meta sobre o anúncio (%)', dica: 'Confirmar com o contador. Padrão 12,5.', tipo: 'pct' },
  { chave: 'taxa_gateway_pct', rotulo: 'Taxa do gateway (%)', dica: 'Só entra quando o gateway não manda o líquido da venda.', tipo: 'pct' },
  { chave: 'whatsapp', rotulo: 'WhatsApp do relatório', dica: 'Só números, com 55 e DDD.', tipo: 'texto' },
]

/** Junta a configuração da planilha com a do painel. Valor vazio no painel = vale a planilha. */
export function mesclarAjustes(planilha: Record<string, string>, painel: Record<string, string | null | undefined>): { valores: Record<string, string>; doPainel: string[] } {
  const valores: Record<string, string> = { ...planilha }
  const doPainel: string[] = []
  for (const [k, v] of Object.entries(painel)) {
    if (v == null || !String(v).trim()) continue
    valores[k] = String(v).trim()
    doPainel.push(k)
  }
  return { valores, doPainel }
}

/** Confere um valor digitado na aba Ajustes. Vazio = apagar (volta a valer a planilha). */
export function validarAjuste(chave: string, texto: string): { ok: true; valor: string | null } | { ok: false; erro: string } {
  const item = ITENS_AJUSTE.find((i) => i.chave === chave)
  if (!item) return { ok: false, erro: `item desconhecido: ${chave}` }
  const t = (texto ?? '').trim()
  if (!t) return { ok: true, valor: null }
  if (item.tipo === 'reais' || item.tipo === 'pct') {
    const n = numeroBR(t)
    if (n == null || n < 0) return { ok: false, erro: `${item.rotulo}: escreva só o número (ex.: ${item.tipo === 'reais' ? '20.000' : '12,5'})` }
    if (item.tipo === 'pct' && n > 100) return { ok: false, erro: `${item.rotulo}: a porcentagem passa de 100` }
    return { ok: true, valor: String(n) }
  }
  if (item.tipo === 'funil') {
    const nums = t.split(/[/;|]/).map((x) => numeroBR(x))
    if (nums.length !== 3 || nums.some((x) => x == null || x <= 0 || x > 100)) return { ok: false, erro: `${item.rotulo}: escreva 3 números separados por barra (ex.: 4 / 23 / 45)` }
    return { ok: true, valor: nums.join(' / ') }
  }
  const dig = t.replace(/\D/g, '')
  if (chave === 'whatsapp' && (dig.length < 12 || dig.length > 13)) return { ok: false, erro: 'WhatsApp: use 55 + DDD + número (12 ou 13 dígitos)' }
  return { ok: true, valor: chave === 'whatsapp' ? dig : t }
}

/** Confere um gasto digitado na aba Ajustes. */
export function validarGasto(e: { mes?: string; grupo?: string; descricao?: string; tipo?: string; valor?: string; recorrente?: boolean }): { ok: true; gasto: Gasto } | { ok: false; erro: string } {
  const mes = mesDeTexto(e.mes ?? '')
  if (!mes) return { ok: false, erro: 'Mês fora do padrão (ex.: 2026-10 ou 10/2026)' }
  const descricao = (e.descricao ?? '').trim()
  if (!descricao) return { ok: false, erro: 'Escreva a descrição do gasto' }
  const tipoTxt = norm(e.tipo ?? '')
  const tipo: Gasto['tipo'] | null = tipoTxt.startsWith('fix') ? 'fixo' : tipoTxt === '%' || tipoTxt.startsWith('perc') ? '%' : null
  if (!tipo) return { ok: false, erro: 'Tipo: fixo (R$ no mês) ou % (sobre o faturamento)' }
  const valor = numeroBR(e.valor ?? '')
  if (valor == null || valor < 0) return { ok: false, erro: 'Valor: escreva só o número (ex.: 1.500,00 ou 6)' }
  if (tipo === '%' && valor > 100) return { ok: false, erro: 'Valor em %: não pode passar de 100' }
  return { ok: true, gasto: { mes, grupo: (e.grupo ?? '').trim() || 'Outros', descricao, tipo, valor, recorrente: Boolean(e.recorrente) } }
}
