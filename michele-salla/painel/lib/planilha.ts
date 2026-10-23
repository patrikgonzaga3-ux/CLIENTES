// Robô da planilha de gastos (de hora em hora). Duas formas de ler, nesta ordem:
//  1) Google Sheets API com conta de serviço: GOOGLE_SERVICE_ACCOUNT_JSON (o JSON da chave) + PLANILHA_ID.
//     O cliente compartilha a planilha com o e-mail da conta de serviço como Leitor. Recomendado.
//  2) Planilha publicada como CSV (Arquivo → Compartilhar → Publicar na web → cada aba em CSV):
//     PLANILHA_CSV_GASTOS e PLANILHA_CSV_CONFIG. Mais simples, mas quem tiver o link vê os valores.
// Abas e colunas: docs/ONBOARDING_CLIENTE.md (modelo em modelo/*.csv).
import 'server-only'
import { createSign } from 'node:crypto'
import { configDaAba, gastosDaAba, lerCSV } from './planilha-ler'
import { apagar, gravar, marcarFonte } from './db'

type Celula = string
const ABA_GASTOS = 'Gastos', ABA_CONFIG = 'Configuração'

function b64url(s: string | Buffer) { return Buffer.from(s).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_') }

async function tokenGoogle(json: string): Promise<string> {
  const sa = JSON.parse(json) as { client_email: string; private_key: string }
  const agora = Math.floor(Date.now() / 1000)
  const cab = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const corpo = b64url(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/spreadsheets.readonly', aud: 'https://oauth2.googleapis.com/token', iat: agora, exp: agora + 3600 }))
  const ass = b64url(createSign('RSA-SHA256').update(`${cab}.${corpo}`).sign(sa.private_key.replace(/\\n/g, '\n')))
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${cab}.${corpo}.${ass}` }),
  })
  const j = await r.json() as { access_token?: string; error_description?: string }
  if (!j.access_token) throw new Error(`Google recusou a conta de serviço: ${j.error_description ?? r.status}`)
  return j.access_token
}

async function abas(): Promise<{ gastos: Celula[][]; config: Celula[][]; via: string }> {
  const sa = process.env.GOOGLE_SERVICE_ACCOUNT_JSON, id = process.env.PLANILHA_ID
  if (sa && id) {
    const tok = await tokenGoogle(sa)
    const rg = [ABA_GASTOS, ABA_CONFIG].map((a) => `ranges=${encodeURIComponent(`'${a}'!A1:H2000`)}`).join('&')
    const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values:batchGet?${rg}&valueRenderOption=FORMATTED_VALUE`, { headers: { Authorization: `Bearer ${tok}` }, cache: 'no-store' })
    if (!r.ok) throw new Error(`Google Sheets HTTP ${r.status}: ${(await r.text()).slice(0, 200)} (a planilha foi compartilhada com o e-mail da conta de serviço? as abas se chamam "${ABA_GASTOS}" e "${ABA_CONFIG}"?)`)
    const j = await r.json() as { valueRanges: { values?: string[][] }[] }
    return { gastos: j.valueRanges[0]?.values ?? [], config: j.valueRanges[1]?.values ?? [], via: 'Google Sheets' }
  }
  const ug = process.env.PLANILHA_CSV_GASTOS, uc = process.env.PLANILHA_CSV_CONFIG
  if (ug) {
    const g = await fetch(ug, { cache: 'no-store' }); if (!g.ok) throw new Error(`CSV de gastos HTTP ${g.status}`)
    const c = uc ? await fetch(uc, { cache: 'no-store' }) : null
    return { gastos: lerCSV(await g.text()), config: c?.ok ? lerCSV(await c.text()) : [], via: 'CSV publicado' }
  }
  throw new Error('planilha não configurada: falta GOOGLE_SERVICE_ACCOUNT_JSON + PLANILHA_ID, ou PLANILHA_CSV_GASTOS')
}

/** Lê a planilha e grava a cópia no banco (pl_gastos e pl_config). */
export async function sincronizarPlanilha(): Promise<string> {
  try {
    const { gastos: g, config: c, via } = await abas()
    const { gastos, avisos } = gastosDaAba(g)
    const cfg = configDaAba(c)
    if (!gastos.length && avisos.length) throw new Error(avisos.join('; '))
    // a planilha é a fonte: troca a cópia inteira
    await apagar('pl_gastos', 'id=not.is.null')
    const r1 = await gravar('pl_gastos', gastos.map((x) => ({ ...x, lido_em: new Date().toISOString() })), 'id')
    const r2 = await gravar('pl_config', Object.entries(cfg).map(([chave, valor]) => ({ chave, valor, lido_em: new Date().toISOString() })), 'chave')
    if (!r1.ok || !r2.ok) throw new Error(r1.erro || r2.erro)
    const txt = `${via}: ${gastos.length} gastos, ${Object.keys(cfg).length} itens de configuração${avisos.length ? ` · ${avisos.length} aviso(s): ${avisos.slice(0, 3).join('; ')}` : ''}`
    await marcarFonte('planilha', true, txt, gastos.length)
    return txt
  } catch (e) {
    const txt = e instanceof Error ? e.message : String(e)
    await marcarFonte('planilha', false, txt)
    return `erro: ${txt}`
  }
}
