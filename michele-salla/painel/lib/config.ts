// Configuração em vigor: cliente.config.ts + aba "Configuração" da planilha (que tem prioridade).
import 'server-only'
import { CLIENTE } from '@/cliente.config'
import { numeroBR } from './planilha-ler'
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
}

export async function cfgEfetiva(): Promise<CfgEfetiva> {
  const p = await lerConfigPlanilha().catch(() => ({} as Record<string, string>))
  const daPlanilha: string[] = []
  const pega = (k: string, padrao: number) => { const n = numeroBR(p[k]); if (n != null) { daPlanilha.push(k); return n } return padrao }
  let funil3x = CLIENTE.funil3x
  if (p.funil3x) {
    const nums = p.funil3x.split(/[/;|]/).map((x) => numeroBR(x)).filter((x): x is number => x != null)
    if (nums.length === 3) { funil3x = { clique: nums[0] / 100, ic: nums[1] / 100, compra: nums[2] / 100 }; daPlanilha.push('funil3x') }
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
  }
}
