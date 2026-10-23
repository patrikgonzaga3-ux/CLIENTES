// Configuração em vigor. Vale, nesta ordem: aba Ajustes do painel > aba "Configuração" da planilha > cliente.config.ts.
import 'server-only'
import { CLIENTE } from '@/cliente.config'
import { mesclarAjustes, numeroBR } from './planilha-ler'
import { lerAjustes } from './ajustes'
import { lerConfigPlanilha } from './dados'

export type CfgEfetiva = {
  nome: string
  ticket: number
  funil3x: { clique: number; ic: number; compra: number }
  metaLucroMes: number
  impostoMetaPct: number
  taxaGatewayPct: number
  whatsapp: string | null
  daPlanilha: string[] // o que veio da planilha
  doPainel: string[] // o que foi escrito na aba Ajustes
}

export async function cfgEfetiva(): Promise<CfgEfetiva> {
  const [plan, painel] = await Promise.all([
    lerConfigPlanilha().catch(() => ({} as Record<string, string>)),
    lerAjustes().catch(() => ({} as Record<string, string>)),
  ])
  const { valores: p, doPainel } = mesclarAjustes(plan, painel)
  const daPlanilha: string[] = []
  const marca = (k: string) => { if (!doPainel.includes(k)) daPlanilha.push(k) }
  const pega = (k: string, padrao: number) => { const n = numeroBR(p[k]); if (n != null) { marca(k); return n } return padrao }
  let funil3x = CLIENTE.funil3x
  if (p.funil3x) {
    const nums = p.funil3x.split(/[/;|]/).map((x) => numeroBR(x)).filter((x): x is number => x != null)
    if (nums.length === 3) { funil3x = { clique: nums[0] / 100, ic: nums[1] / 100, compra: nums[2] / 100 }; marca('funil3x') }
  }
  return {
    nome: CLIENTE.nome,
    ticket: pega('ticket', CLIENTE.ticket),
    funil3x,
    metaLucroMes: pega('meta_lucro', CLIENTE.metaLucroMes),
    impostoMetaPct: pega('imposto_meta_pct', CLIENTE.impostoMetaPct),
    taxaGatewayPct: pega('taxa_gateway_pct', CLIENTE.taxaGatewayPct),
    whatsapp: p.whatsapp ?? null,
    daPlanilha,
    doPainel: doPainel.filter((k) => k in p),
  }
}
