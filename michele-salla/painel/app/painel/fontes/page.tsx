// ABA FONTES DE DADOS: se cada conexão está funcionando (gateway, Meta, planilha, rastreio da página), o que falta
// configurar e as linhas prontas para colar (webhook, rastreio, parâmetros de URL). Nunca mostra senha nem chave.
import { headers } from 'next/headers'
import { CLIENTE } from '@/cliente.config'
import { cfgEfetiva } from '@/lib/config'
import { emDemo, fontes as lerFontes, ultimos } from '@/lib/dados'
import { porta, Shell } from '../_shell'
import { horaBR, int } from '../_ui/fmt'
import { Caixa, Secao, Tabela, Titulo, td, tdL, th, thL } from '../_ui/ui'

export const dynamic = 'force-dynamic'
const tem = (k: string) => Boolean((process.env[k] || '').trim())
function emailConta(): string | null {
  try { return (JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}') as { client_email?: string }).client_email ?? null } catch { return null }
}
const Ok = ({ ok, txt }: { ok: boolean | null; txt?: string }) => <span style={{ fontWeight: 800, color: ok == null ? 'var(--mute)' : ok ? 'var(--g)' : 'var(--pn-verm)' }}>{ok == null ? '—' : ok ? 'ok' : 'com problema'}{txt ? ` · ${txt}` : ''}</span>
const Codigo = ({ children }: { children: string }) => <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 12.5, background: 'rgb(var(--pn-rgb) / .05)', padding: '10px 12px', borderRadius: 10, margin: '6px 0 0' }}>{children}</pre>

export default async function Fontes() {
  const b = await porta(); if (b) return b
  const h = await headers()
  const origem = `${h.get('x-forwarded-proto') || 'https'}://${h.get('x-forwarded-host') || h.get('host')}`
  const [fs, ult, cfg] = await Promise.all([lerFontes(), ultimos(), cfgEfetiva()])
  const f = (n: string) => fs.find((x) => x.nome === n)
  const velho = (iso?: string | null, horas = 3) => !iso || Date.now() - Date.parse(iso) > horas * 3600_000
  const meta = f('meta'), plan = f('planilha')
  const planilhaPorGoogle = tem('GOOGLE_SERVICE_ACCOUNT_JSON') && tem('PLANILHA_ID')

  const vars: [string, boolean, string][] = [
    ['SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY', tem('SUPABASE_URL') && tem('SUPABASE_SERVICE_ROLE_KEY'), 'banco do cliente (Supabase → Project Settings → API)'],
    ['PAINEL_SENHA', tem('PAINEL_SENHA'), 'senha do painel'],
    ['WEBHOOK_TOKEN', tem('WEBHOOK_TOKEN'), 'senha que vai no link do webhook do gateway'],
    ['CRON_SECRET', tem('CRON_SECRET'), 'senha do robô de hora em hora'],
    ['META_ACCESS_TOKEN e META_AD_ACCOUNT_ID', tem('META_ACCESS_TOKEN') && tem('META_AD_ACCOUNT_ID'), 'token do usuário do sistema da BM (ads_read) e id da conta de anúncio'],
    ['Planilha: GOOGLE_SERVICE_ACCOUNT_JSON + PLANILHA_ID (ou PLANILHA_CSV_GASTOS)', planilhaPorGoogle || tem('PLANILHA_CSV_GASTOS'), planilhaPorGoogle ? 'pela conta de serviço do Google' : tem('PLANILHA_CSV_GASTOS') ? 'pelo CSV publicado' : 'falta configurar'],
  ]

  return (
    <Shell active="fontes">
      <Titulo titulo="Fontes de dados" sub="De onde vêm os números do painel e se cada conexão está funcionando agora." />
      {emDemo() && <Caixa tom="ok">Demonstração: nenhuma fonte real está ligada. Tire DEMO=1 da Vercel para usar os dados do cliente.</Caixa>}

      <Secao titulo="Situação de cada fonte">
        <Tabela min={720}>
          <thead><tr><th style={thL}>Fonte</th><th style={thL}>Situação</th><th style={th}>Última leitura</th><th style={thL}>Detalhe</th></tr></thead>
          <tbody>
            {CLIENTE.gateways.map((g) => { const x = f(`gateway:${g}`); return <tr key={g}><td style={tdL}><strong>Vendas · {g}</strong><div style={{ color: 'var(--mute)', fontSize: 11.5 }}>webhook, na hora</div></td><td style={tdL}><Ok ok={x ? x.ok : ult.evento?.gateway === g ? true : null} txt={x || ult.evento?.gateway === g ? undefined : 'nenhum aviso ainda'} /></td><td style={td}>{horaBR(x?.ultima_leitura ?? (ult.evento?.gateway === g ? ult.evento.recebido_em : null))}</td><td style={tdL}>{x?.detalhe ?? 'Cadastre o webhook (abaixo) e faça uma venda de teste.'}{ult.eventos30d ? ` · ${int(ult.eventos30d)} avisos em 30 dias` : ''}</td></tr> })}
            <tr><td style={tdL}><strong>Gasto do Meta</strong><div style={{ color: 'var(--mute)', fontSize: 11.5 }}>robô de hora em hora</div></td><td style={tdL}><Ok ok={meta ? meta.ok && !velho(meta.ultima_leitura) : null} txt={meta && velho(meta.ultima_leitura) ? 'sem leitura há mais de 3 h' : undefined} /></td><td style={td}>{horaBR(meta?.ultima_leitura)}</td><td style={tdL}>{meta?.detalhe ?? 'Ainda não leu. Clique em Atualizar ou confira as variáveis do Meta.'}</td></tr>
            <tr><td style={tdL}><strong>Planilha de gastos</strong><div style={{ color: 'var(--mute)', fontSize: 11.5 }}>robô de hora em hora</div></td><td style={tdL}><Ok ok={plan ? plan.ok && !velho(plan.ultima_leitura) : null} txt={plan && velho(plan.ultima_leitura) ? 'sem leitura há mais de 3 h' : undefined} /></td><td style={td}>{horaBR(plan?.ultima_leitura)}</td><td style={tdL}>{plan?.detalhe ?? 'Ainda não leu.'}{cfg.daPlanilha.length ? ` · da aba Configuração: ${cfg.daPlanilha.join(', ')}` : ''}</td></tr>
            <tr><td style={tdL}><strong>Comportamento na página</strong><div style={{ color: 'var(--mute)', fontSize: 11.5 }}>rastreio, a cada 10 s de visita</div></td><td style={tdL}><Ok ok={ult.visita ? !velho(ult.visita.inicio, 48) : null} txt={ult.visita ? undefined : 'nenhuma visita ainda'} /></td><td style={td}>{horaBR(ult.visita?.inicio)}</td><td style={tdL}>{ult.visita ? `última visita na página ${ult.visita.slug}` : 'Cole a linha de rastreio (abaixo) na página de vendas.'}</td></tr>
          </tbody>
        </Tabela>
      </Secao>

      <Secao titulo="Variáveis na Vercel" sub="Só mostra se estão preenchidas; nunca o valor.">
        <Tabela min={560}>
          <thead><tr><th style={thL}>Variável</th><th style={thL}>Preenchida</th><th style={thL}>Para quê</th></tr></thead>
          <tbody>{vars.map(([n, ok, p]) => <tr key={n}><td style={tdL}><code>{n}</code></td><td style={tdL}><span style={{ fontWeight: 800, color: ok ? 'var(--g)' : 'var(--pn-verm)' }}>{ok ? 'sim' : 'falta'}</span></td><td style={tdL}>{p}</td></tr>)}</tbody>
        </Tabela>
        {emailConta() && <div className="mt-3"><Caixa tom="info">Compartilhe a planilha de gastos (como Leitor) com: <strong>{emailConta()}</strong></Caixa></div>}
      </Secao>

      <Secao titulo="Linhas prontas para colar">
        {CLIENTE.gateways.map((g) => (
          <div key={g} style={{ marginBottom: 14 }}>
            <strong>Webhook · {g}</strong>{' '}(no painel do gateway, evento de venda, todos os status{g === 'greenn' ? ' + lead/checkout abandonado' : ''}):
            <Codigo>{`${origem}/api/webhook/${g}?token=<WEBHOOK_TOKEN>`}</Codigo>
          </div>
        ))}
        {CLIENTE.sites.map((s) => (
          <div key={s.id} style={{ marginBottom: 14 }}>
            <strong>Rastreio · {s.nome}</strong>{' '}(1 linha por página, antes de &lt;/body&gt; ou num bloco HTML):
            {s.paginas.map(([slug, rot]) => <div key={slug} style={{ marginTop: 6 }}><span style={{ fontSize: 12.5, color: 'var(--sub)' }}>{rot}</span><Codigo>{`<script async src="${origem}/rastreio.js" data-slug="${slug}" data-checkout="sim"></script>`}</Codigo></div>)}
            <div style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 6 }}>Blocos: marque cada seção com <code>data-bloco=&quot;01&quot;</code>, <code>&quot;02&quot;</code>… (ou a classe <code>elb-01</code>). Sem marcação, o rastreio conta as seções de cima da página, na ordem. <code>data-checkout=&quot;sim&quot;</code> leva o rastreio do anúncio para o checkout; tire se o cliente preferir.</div>
          </div>
        ))}
        <div><strong>Parâmetros de URL de todo anúncio</strong>{' '}(Meta → anúncio → Parâmetros de URL):
          <Codigo>{'utm_source=FB&utm_medium={{placement}}&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.id}}'}</Codigo>
        </div>
        <div style={{ marginTop: 14 }}><strong>Robô de hora em hora</strong>{' '}(Supabase → SQL, com pg_cron e pg_net ligados):
          <Codigo>{`select cron.schedule('painel-lucro-hora', '17 * * * *', $$ select net.http_get(url := '${origem}/api/cron?key=<CRON_SECRET>', timeout_milliseconds := 120000) $$);`}</Codigo>
        </div>
      </Secao>
    </Shell>
  )
}
