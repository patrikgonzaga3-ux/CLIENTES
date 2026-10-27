// ════════════════════════════════════════════════════════════════════
// O ÚNICO ARQUIVO QUE MUDA DE CLIENTE PARA CLIENTE (além das variáveis de ambiente da Vercel).
// Preencher com o docs/ONBOARDING_CLIENTE.md. A aba "Configuração" da planilha de gastos, quando
// preenchida, tem prioridade sobre meta, ticket, impostos e metas do funil 3x daqui.
// ════════════════════════════════════════════════════════════════════
import type { Gateway } from './lib/gateways'

export type Pagina = [slug: string, rotulo: string]
export type SiteCfg = {
  id: string
  nome: string
  /** domínio da página de vendas, sem https:// e sem www (o rastreio só aceita dados dele) */
  dominio: string
  /** começo do slug das páginas; cada página tem o slug `${prefixo}-<letra ou nome>` */
  prefixo: string
  paginas: Pagina[]
  /** nomes dos blocos da página, na ordem (01, 02…); vazio = o painel numera sozinho */
  blocos: string[]
  /** blocos que têm preço + botão de comprar (para "chegou na oferta") */
  blocosOferta: number[]
  /** rótulo de cada botão de compra (data-cta do botão); opcional */
  botoes: Record<string, string>
}

export const CLIENTE = {
  /** nome que aparece no painel */
  nome: 'Michele Salla',
  /** gateways que mandam vendas para o painel */
  gateways: ['greenn', 'hotmart'] as Gateway[],
  /**
   * Produtos que contam no painel (id do produto no gateway). Vazio = todos os produtos do gateway.
   * tipo: principal | bump | upsell | assinatura (só para agrupar na aba Lucro).
   */
  // Patrik (23/10): contam todos os produtos da Greenn e da Hotmart; o painel mostra os dois separados.
  produtos: [] as { id: string; nome: string; tipo: 'principal' | 'bump' | 'upsell' | 'assinatura' }[],
  /** preço do produto principal (base do funil 3x) */
  ticket: 47, // Desafio 7 em 7 (Greenn, oferta E1YMM7 desde 27/10; antes 1qsr9k, R$ 67)
  /** metas do funil 3x em fração do ticket: clique 4%, initiate checkout 23%, compra 45% */
  funil3x: { clique: 0.04, ic: 0.23, compra: 0.45 },
  /** meta de lucro do mês em R$ (0 = sem meta) */
  metaLucroMes: 0,
  /** imposto do Meta sobre o gasto com anúncio, em % (confirmar com o contador do cliente) */
  impostoMetaPct: 12.5,
  /** taxa do gateway em %, usada só quando o gateway não manda o líquido da venda */
  taxaGatewayPct: 10,
  /** páginas de venda com o rastreio de comportamento (/rastreio.js) */
  sites: [
    {
      id: 'michele',
      nome: 'michelesalla.com.br',
      dominio: 'michelesalla.com.br',
      prefixo: 'desafio7em7',
      paginas: [['desafio7em7-a', 'Desafio 7 em 7']],
      // blocos 03 a 18 da página (WordPress + Elementor), na ordem
      blocos: ['Promessa e ruminações', 'Feito para você', 'Antes e depois', 'Pensamentos', 'Alerta',
        'Benefícios', 'O que vai receber', 'Bônus', 'É pra você que', 'Recapitulando', 'Oferta',
        'Duas opções', 'Autora', 'Oferta repetida', 'Perguntas', 'Rodapé'],
      blocosOferta: [11, 14],
      botoes: {},
    },
  ] as SiteCfg[],
}
