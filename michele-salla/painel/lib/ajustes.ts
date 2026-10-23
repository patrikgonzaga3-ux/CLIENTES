// Aba Ajustes: valores e gastos escritos no próprio painel (tabelas pl_ajustes e pl_gastos_painel).
// O que está aqui vale mais que a planilha. A planilha serve para puxar os dados iniciais.
import 'server-only'
import { randomUUID } from 'node:crypto'
import { apagar, gravar, ler } from './db'
import * as demo from './demo'
import type { Gasto } from './lucro'

const q = encodeURIComponent
const emDemo = () => process.env.DEMO === '1'
export type GastoPainel = Gasto & { id: string; origem: string }
const numG = <T extends Gasto>(g: T): T => ({ ...g, valor: Number(g.valor) || 0 })

export async function lerAjustes(): Promise<Record<string, string>> {
  if (emDemo()) return {}
  const r = await ler<{ chave: string; valor: string | null }>('pl_ajustes', 'select=chave,valor')
  return Object.fromEntries(r.filter((x) => x.valor != null).map((x) => [x.chave, x.valor as string]))
}

/** Grava (ou apaga, com valor null) um item da aba Ajustes. */
export async function salvarAjuste(chave: string, valor: string | null): Promise<{ ok: boolean; erro?: string }> {
  if (valor == null) return (await apagar('pl_ajustes', `chave=eq.${q(chave)}`)) ? { ok: true } : { ok: false, erro: 'o banco não respondeu' }
  return gravar('pl_ajustes', { chave, valor, editado_em: new Date().toISOString() }, 'chave')
}

export async function gastosPainel(): Promise<GastoPainel[]> {
  if (emDemo()) return []
  const r = await ler<GastoPainel>('pl_gastos_painel', 'select=id,mes,grupo,descricao,tipo,valor,recorrente,origem&order=mes.desc,grupo.asc,descricao.asc')
  return r.map(numG)
}
/** Cópia da planilha (pl_gastos), só para mostrar e puxar. */
export async function gastosDaPlanilha(): Promise<(Gasto & { id: string })[]> {
  if (emDemo()) return demo.gastos().map((g, i) => ({ ...g, id: `demo-${i}` }))
  const r = await ler<Gasto & { id: string }>('pl_gastos', 'select=id,mes,grupo,descricao,tipo,valor,recorrente&order=mes.desc,grupo.asc')
  return r.map(numG)
}

export async function salvarGasto(g: Gasto & { id?: string }): Promise<{ ok: boolean; erro?: string }> {
  const id = g.id || randomUUID()
  return gravar('pl_gastos_painel', { id, mes: g.mes, grupo: g.grupo, descricao: g.descricao, tipo: g.tipo, valor: g.valor, recorrente: g.recorrente, editado_em: new Date().toISOString() }, 'id')
}
export async function apagarGasto(id: string): Promise<boolean> {
  return apagar('pl_gastos_painel', `id=eq.${q(id)}`)
}

/** Troca a lista de gastos do painel pela cópia da planilha. */
export async function puxarDaPlanilha(): Promise<{ ok: boolean; n: number; erro?: string }> {
  const p = await gastosDaPlanilha()
  if (!p.length) return { ok: false, n: 0, erro: 'a planilha ainda não tem gastos lidos (veja a aba Fontes de dados)' }
  if (!(await apagar('pl_gastos_painel', 'id=not.is.null'))) return { ok: false, n: 0, erro: 'o banco não respondeu' }
  const agora = new Date().toISOString()
  const r = await gravar('pl_gastos_painel', p.map((g) => ({ id: `planilha-${g.id}`, mes: g.mes, grupo: g.grupo, descricao: g.descricao, tipo: g.tipo, valor: g.valor, recorrente: g.recorrente, origem: 'planilha', editado_em: agora })), 'id')
  return r.ok ? { ok: true, n: p.length } : { ok: false, n: 0, erro: r.erro }
}
