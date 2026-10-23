// ABA AJUSTES: escrever e editar no próprio painel os valores (meta de lucro, ticket, funil 3x, impostos) e a lista
// de gastos. O que está aqui vale mais que a planilha; a planilha serve para puxar os dados iniciais.
import type { CSSProperties } from 'react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CLIENTE } from '@/cliente.config'
import { apagarGasto, gastosDaPlanilha, gastosPainel, lerAjustes, puxarDaPlanilha, salvarAjuste, salvarGasto } from '@/lib/ajustes'
import { logado } from '@/lib/auth'
import { cfgEfetiva } from '@/lib/config'
import { emDemo, lerConfigPlanilha } from '@/lib/dados'
import { ITENS_AJUSTE, validarAjuste, validarGasto } from '@/lib/planilha-ler'
import { porta, Shell } from '../_shell'
import { brl, num2 } from '../_ui/fmt'
import { Caixa, Secao, Titulo, Vazio } from '../_ui/ui'

export const dynamic = 'force-dynamic'
type SP = Record<string, string | string[] | undefined>

const volta = (msg: { ok?: string; erro?: string }): never => {
  revalidatePath('/painel', 'layout')
  const qs = new URLSearchParams(msg as Record<string, string>).toString()
  redirect(`/painel/ajustes?${qs}`)
}
async function guarda() {
  if (!(await logado())) redirect('/painel')
  if (emDemo()) volta({ erro: 'Na demonstração nada é gravado.' })
}

async function salvarValores(fd: FormData) {
  'use server'
  await guarda()
  const erros: string[] = []
  let n = 0
  for (const item of ITENS_AJUSTE) {
    if (!fd.has(item.chave)) continue
    const v = validarAjuste(item.chave, String(fd.get(item.chave) ?? ''))
    if (!v.ok) { erros.push(v.erro); continue }
    const r = await salvarAjuste(item.chave, v.valor)
    if (!r.ok) erros.push(`${item.rotulo}: ${r.erro}`); else n++
  }
  volta(erros.length ? { erro: erros.join(' · ') } : { ok: `Valores salvos (${n}).` })
}

async function gravarGasto(fd: FormData) {
  'use server'
  await guarda()
  const v = validarGasto({
    mes: String(fd.get('mes') ?? ''), grupo: String(fd.get('grupo') ?? ''), descricao: String(fd.get('descricao') ?? ''),
    tipo: String(fd.get('tipo') ?? ''), valor: String(fd.get('valor') ?? ''), recorrente: fd.get('recorrente') === 'sim',
  })
  if (!v.ok) volta({ erro: v.erro })
  else {
    const id = String(fd.get('id') ?? '') || undefined
    const r = await salvarGasto({ ...v.gasto, id })
    volta(r.ok ? { ok: id ? `Gasto "${v.gasto.descricao}" atualizado.` : `Gasto "${v.gasto.descricao}" incluído.` } : { erro: `Não salvou: ${r.erro}` })
  }
}

async function removerGasto(fd: FormData) {
  'use server'
  await guarda()
  const id = String(fd.get('id') ?? '')
  volta(id && (await apagarGasto(id)) ? { ok: 'Gasto apagado.' } : { erro: 'Não consegui apagar. Tente de novo.' })
}

async function puxar(fd: FormData) {
  'use server'
  await guarda()
  if (fd.get('confirma') !== 'sim') volta({ erro: 'Marque a confirmação para trocar a lista do painel pela da planilha.' })
  const r = await puxarDaPlanilha()
  volta(r.ok ? { ok: `${r.n} gastos puxados da planilha. Agora é só editar aqui.` } : { erro: `Não puxou: ${r.erro}` })
}

const campo: CSSProperties = { padding: '9px 11px', fontSize: 16, borderRadius: 10, border: '1px solid rgb(var(--pn-rgb) / .18)', background: 'var(--pn-card)', color: 'var(--ink)', width: '100%', minWidth: 0 }
const rot: CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--sub)', display: 'block', marginBottom: 4 }
const botao = (cor = 'var(--o)', txt = '#000'): CSSProperties => ({ padding: '10px 18px', fontSize: 14, fontWeight: 800, borderRadius: 99, border: 'none', background: cor, color: txt, cursor: 'pointer' })
const cartao: CSSProperties = { background: 'var(--pn-card)', border: '1px solid rgb(var(--pn-rgb) / .08)', borderRadius: 16, padding: 14 }
const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

function CamposGasto({ g }: { g?: { mes: string; grupo: string; descricao: string; tipo: string; valor: number; recorrente: boolean } }) {
  const mesAtual = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }).slice(0, 7)
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(130px, 100%), 1fr))' }}>
      <label><span style={rot}>Mês</span><input name="mes" defaultValue={g?.mes ?? mesAtual} placeholder="2026-10" style={campo} required /></label>
      <label><span style={rot}>Grupo</span><input name="grupo" defaultValue={g?.grupo ?? ''} placeholder="Equipe" style={campo} /></label>
      <label style={{ gridColumn: 'span 2' }}><span style={rot}>Descrição</span><input name="descricao" defaultValue={g?.descricao ?? ''} placeholder="Gestor de tráfego" style={campo} required /></label>
      <label><span style={rot}>Tipo</span>
        <select name="tipo" defaultValue={g?.tipo ?? 'fixo'} style={campo}><option value="fixo">fixo (R$ no mês)</option><option value="%">% do faturamento</option></select>
      </label>
      <label><span style={rot}>Valor</span><input name="valor" defaultValue={g ? num2(g.valor) : ''} placeholder="1.500,00" inputMode="decimal" style={campo} required /></label>
      <label><span style={rot}>Repete nos meses seguintes?</span>
        <select name="recorrente" defaultValue={g?.recorrente === false ? 'nao' : 'sim'} style={campo}><option value="sim">sim</option><option value="nao">não, só neste mês</option></select>
      </label>
    </div>
  )
}

export default async function Ajustes({ searchParams }: { searchParams: Promise<SP> }) {
  const b = await porta(); if (b) return b
  const sp = await searchParams
  const ok = um(sp.ok), erro = um(sp.erro)
  const [cfg, painel, planCfg, lista, plan] = await Promise.all([cfgEfetiva(), lerAjustes(), lerConfigPlanilha().catch(() => ({} as Record<string, string>)), gastosPainel(), gastosDaPlanilha()])
  const emVigor: Record<string, string> = {
    meta_lucro: cfg.metaLucroMes ? brl(cfg.metaLucroMes) : 'sem meta',
    ticket: brl(cfg.ticket),
    funil3x: `${num2(cfg.funil3x.clique * 100)} / ${num2(cfg.funil3x.ic * 100)} / ${num2(cfg.funil3x.compra * 100)}`,
    imposto_meta_pct: `${num2(cfg.impostoMetaPct)}%`,
    taxa_gateway_pct: `${num2(cfg.taxaGatewayPct)}%`,
    whatsapp: cfg.whatsapp ?? '—',
  }
  const origem = (k: string) => (cfg.doPainel.includes(k) ? 'escrito aqui' : k in planCfg ? 'da planilha' : 'padrão do painel')
  const usandoPainel = lista.length > 0

  return (
    <Shell active="ajustes">
      <Titulo titulo="Ajustes" sub="Escreva e edite os números do painel. O que estiver aqui vale mais que a planilha; a planilha serve só para puxar os dados iniciais." />
      {ok && <div className="mb-3"><Caixa tom="ok">✅ {ok}</Caixa></div>}
      {erro && <div className="mb-3" role="alert"><Caixa tom="erro">⚠️ {erro}</Caixa></div>}
      {emDemo() && <div className="mb-3"><Caixa tom="alerta">Demonstração: dá para ver a tela, mas nada é gravado.</Caixa></div>}

      <Secao titulo="Metas e valores" sub="Deixe em branco para voltar a valer a planilha (ou o padrão do painel).">
        <form action={salvarValores} style={cartao}>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))' }}>
            {ITENS_AJUSTE.map((i) => (
              <label key={i.chave}>
                <span style={rot}>{i.rotulo}</span>
                <input name={i.chave} defaultValue={painel[i.chave] ?? ''} placeholder={`em vigor: ${emVigor[i.chave]}`} inputMode={i.tipo === 'texto' || i.tipo === 'funil' ? 'text' : 'decimal'} style={campo} />
                <span style={{ fontSize: 11.5, color: 'var(--mute)', display: 'block', marginTop: 3, lineHeight: 1.4 }}>{i.dica} Hoje: <strong>{emVigor[i.chave]}</strong> ({origem(i.chave)}).</span>
              </label>
            ))}
          </div>
          <div className="mt-3"><button type="submit" style={botao()}>Salvar valores</button></div>
        </form>
      </Secao>

      <Secao titulo="Gastos" sub={usandoPainel
        ? `O lucro está usando a lista do painel (${lista.length} linhas). Fixo = R$ no mês; % = sobre o faturamento. Para mudar um valor a partir de um mês, inclua uma linha nova da mesma despesa; valor 0 encerra.`
        : plan.length ? `O lucro está usando a planilha (${plan.length} linhas). Para editar aqui, puxe a lista da planilha para o painel.` : 'Ainda não há gastos. Inclua abaixo ou ligue a planilha (aba Fontes de dados).'}>
        {usandoPainel ? (
          <div className="grid gap-3">
            {lista.map((g) => (
              <form key={g.id} action={gravarGasto} style={cartao}>
                <input type="hidden" name="id" value={g.id} />
                <CamposGasto g={g} />
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <button type="submit" style={botao()}>Salvar</button>
                  <button type="submit" formAction={removerGasto} style={botao('rgba(192,57,43,.12)', 'var(--pn-verm)')}>Apagar</button>
                  <span style={{ fontSize: 11.5, color: 'var(--mute)' }}>{g.origem === 'planilha' ? 'veio da planilha' : 'escrito no painel'}</span>
                </div>
              </form>
            ))}
          </div>
        ) : plan.length ? (
          <div style={cartao}>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6 }}>
              {plan.slice(0, 30).map((g) => <li key={g.id}>{g.mes} · {g.grupo} · {g.descricao}: {g.tipo === '%' ? `${num2(g.valor)}%` : brl(g.valor)}{g.recorrente ? ' (repete)' : ''}</li>)}
            </ul>
          </div>
        ) : <Vazio>Nenhum gasto ainda.</Vazio>}

        <form action={gravarGasto} className="mt-3" style={{ ...cartao, borderStyle: 'dashed' }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Incluir gasto</div>
          <CamposGasto />
          <div className="mt-3"><button type="submit" style={botao()}>Incluir</button></div>
        </form>

        <form action={puxar} className="mt-3" style={cartao}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Puxar da planilha</div>
          <p style={{ fontSize: 13, color: 'var(--sub)', margin: '4px 0 8px', lineHeight: 1.5 }}>
            Troca a lista de gastos do painel pela que está na planilha agora ({plan.length} linhas). Use para começar ou para recomeçar do zero.
          </p>
          <label style={{ fontSize: 13.5, display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="confirma" value="sim" /> Entendi que as edições feitas aqui serão trocadas</label>
          <div className="mt-3"><button type="submit" style={botao('var(--ink)', 'var(--pn-card)')} disabled={!plan.length}>Puxar da planilha</button></div>
        </form>
      </Secao>

      <div className="mt-6"><Caixa tom="info">O gasto com anúncio do Meta não entra aqui: ele vem da conta de anúncio ({CLIENTE.nome}). Vendas vêm da Greenn e da Hotmart.</Caixa></div>
    </Shell>
  )
}
