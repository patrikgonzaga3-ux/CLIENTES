// ABA ACESSOS (só o administrador): quem entra no painel, links de convite e de troca de senha.
import { quem } from '@/lib/auth'
import { emDemo } from '@/lib/dados'
import { listarConvites, listarUsuarios } from '@/lib/usuarios'
import { porta, Shell } from '../_shell'
import { horaBR } from '../_ui/fmt'
import { Caixa, Secao, Tabela, Titulo, Vazio, td, tdL, th, thL } from '../_ui/ui'
import { BotaoConvite, BotaoCancelar, BotaoRemover, BotaoTrocarSenha } from './botoes'

export const dynamic = 'force-dynamic'

export default async function Acessos() {
  const b = await porta(); if (b) return b
  const eu = await quem()
  if (eu?.papel !== 'admin') {
    return <Shell active="acessos"><Titulo titulo="Acessos" /><Vazio>Só o administrador vê esta aba.</Vazio></Shell>
  }
  const [pessoas, convites] = emDemo() ? [[], []] : await Promise.all([listarUsuarios(), listarConvites()])
  const agora = Date.now()
  const pendentes = convites.filter((c) => !c.usado_em && Date.parse(c.expira_em) > agora)
  return (
    <Shell active="acessos">
      <Titulo titulo="Acessos" sub="Quem entra no painel. Cada pessoa tem o próprio e-mail e senha. Só você (administrador) cria convites." />
      {emDemo() && <div className="mb-3"><Caixa tom="alerta">Demonstração: os convites não funcionam aqui.</Caixa></div>}

      <Secao titulo="Convidar alguém" sub="Gera um link que vale 1 vez, por 7 dias. Mande para a pessoa: ela abre, coloca o e-mail dela e cria a senha.">
        <BotaoConvite />
      </Secao>

      <Secao titulo="Pessoas com acesso">
        {pessoas.length ? (
          <Tabela min={560}>
            <thead><tr><th style={thL}>E-mail</th><th style={thL}>Tipo</th><th style={th}>Último acesso</th><th style={th}></th></tr></thead>
            <tbody>{pessoas.map((p) => (
              <tr key={p.email}>
                <td style={tdL}>{p.email}</td>
                <td style={tdL}>{p.papel === 'admin' ? 'administrador' : 'convidado'}</td>
                <td style={td}>{horaBR(p.ultimo_acesso)}</td>
                <td style={td}>{p.papel !== 'admin' && <span style={{ display: 'inline-flex', gap: 6 }}><BotaoTrocarSenha email={p.email} /><BotaoRemover email={p.email} /></span>}</td>
              </tr>
            ))}</tbody>
          </Tabela>
        ) : <Vazio>Ninguém ainda.</Vazio>}
      </Secao>

      <Secao titulo="Convites esperando uso" sub="Links gerados que ainda não foram usados.">
        {pendentes.length ? (
          <Tabela min={560}>
            <thead><tr><th style={thL}>Para</th><th style={th}>Criado</th><th style={th}>Vale até</th><th style={th}></th></tr></thead>
            <tbody>{pendentes.map((c) => (
              <tr key={c.token_hash}>
                <td style={tdL}>{c.email_destino ? `troca de senha · ${c.email_destino}` : c.nota || 'convite'}</td>
                <td style={td}>{horaBR(c.criado_em)}</td>
                <td style={td}>{horaBR(c.expira_em)}</td>
                <td style={td}><BotaoCancelar id={c.token_hash} /></td>
              </tr>
            ))}</tbody>
          </Tabela>
        ) : <Vazio>Nenhum convite esperando.</Vazio>}
      </Secao>
      <div className="mt-6"><Caixa tom="info">O link mostra o convite só uma vez: copie e mande na hora. Se perder, cancele e gere outro. Ninguém (nem você) consegue ver a senha das pessoas.</Caixa></div>
    </Shell>
  )
}
