// Os robôs de hora em hora: gasto do Meta + planilha de gastos. Chamados por /api/cron (agendado) e
// /api/atualizar (botão Atualizar do painel).
import 'server-only'
import { sincronizarMeta } from './meta'
import { sincronizarPlanilha } from './planilha'

export async function rodarRobos(diasMeta = 3) {
  if (process.env.DEMO === '1') return { meta: 'demonstração', planilha: 'demonstração' }
  const [meta, planilha] = await Promise.all([sincronizarMeta(diasMeta), sincronizarPlanilha()])
  return { meta, planilha }
}
