// Acesso ao Supabase do cliente via REST (PostgREST), com a chave service_role. SÓ no servidor.
// Sem SDK: fetch puro. Toda leitura que falha fica registrada e o painel avisa "dados incompletos".
import 'server-only'
import { cache } from 'react'

const URL_ = () => (process.env.SUPABASE_URL || '').replace(/\s/g, '').replace(/\/+$/, '')
const KEY = () => (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\s/g, '')
export const bancoConfigurado = () => Boolean(URL_() && KEY())
const h = (extra: Record<string, string> = {}) => ({ apikey: KEY(), Authorization: `Bearer ${KEY()}`, 'Content-Type': 'application/json', ...extra })

// Falhas de leitura desta requisição (cache do React = uma lista por página aberta).
const registro = cache(() => new Set<string>())
export const falhasDeLeitura = () => [...registro()]

/** Lê todas as linhas (pagina de 1000 em 1000). Em erro, devolve o que conseguiu e registra a falha. */
export async function ler<T = Record<string, unknown>>(tabela: string, query = ''): Promise<T[]> {
  const falhas = registro()
  if (!bancoConfigurado()) { falhas.add(tabela); return [] }
  const out: T[] = []
  for (let de = 0; de < 200_000; de += 1000) {
    try {
      const r = await fetch(`${URL_()}/rest/v1/${tabela}?${query}`, { headers: h({ Range: `${de}-${de + 999}`, 'Range-Unit': 'items' }), cache: 'no-store' })
      if (!r.ok) { console.error(`[db] ${tabela} HTTP ${r.status}`, await r.text().catch(() => '')); falhas.add(tabela); break }
      const rows = (await r.json()) as T[]
      out.push(...rows)
      if (rows.length < 1000) break
    } catch (e) { console.error(`[db] ${tabela}`, e); falhas.add(tabela); break }
  }
  return out
}

/** Grava (upsert) linhas. ignorar=true não sobrescreve linha que já existe. Devolve se deu certo. */
export async function gravar(tabela: string, linhas: object | object[], onConflict: string, ignorar = false): Promise<{ ok: boolean; erro?: string }> {
  if (!bancoConfigurado()) return { ok: false, erro: 'banco não configurado' }
  const arr = Array.isArray(linhas) ? linhas : [linhas]
  if (!arr.length) return { ok: true }
  for (let i = 0; i < arr.length; i += 500) {
    const r = await fetch(`${URL_()}/rest/v1/${tabela}?on_conflict=${onConflict}`, {
      method: 'POST', cache: 'no-store',
      headers: h({ Prefer: `resolution=${ignorar ? 'ignore' : 'merge'}-duplicates,return=minimal` }),
      body: JSON.stringify(arr.slice(i, i + 500)),
    }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }) as Response)
    if (!r.ok) return { ok: false, erro: `HTTP ${r.status} ${(await r.text().catch(() => '')).slice(0, 300)}` }
  }
  return { ok: true }
}

/** Apaga linhas por filtro PostgREST (ex.: "id=not.is.null"). */
export async function apagar(tabela: string, filtro: string): Promise<boolean> {
  if (!bancoConfigurado()) return false
  const r = await fetch(`${URL_()}/rest/v1/${tabela}?${filtro}`, { method: 'DELETE', headers: h(), cache: 'no-store' }).catch(() => null)
  return !!r?.ok
}

/** Registra a saúde de uma fonte (aba Fontes do painel). */
export async function marcarFonte(nome: string, ok: boolean, detalhe: string, linhas?: number) {
  await gravar('pl_fontes', { nome, ultima_leitura: new Date().toISOString(), ok, detalhe: detalhe.slice(0, 500), linhas: linhas ?? null }, 'nome')
}
