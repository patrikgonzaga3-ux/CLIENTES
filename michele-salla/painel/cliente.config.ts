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
  /** outros domínios onde a mesma página/quiz pode rodar (ex.: a prévia na Vercel) */
  outrosDominios?: string[]
  /** começo do slug das páginas; cada página tem o slug `${prefixo}-<letra ou nome>` */
  prefixo: string
  paginas: Pagina[]
  /** nomes dos blocos da página, na ordem (01, 02…); vazio = o painel numera sozinho */
  blocos: string[]
  /** blocos que têm preço + botão de comprar (para "chegou na oferta") */
  blocosOferta: number[]
  /** rótulo de cada botão de compra (data-cta do botão); opcional */
  botoes: Record<string, string>
  /** onde a venda acontece (nome no funil do painel); padrão Greenn */
  gateway?: string
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
  ticket: 37, // 06/11: Pilates em Casa (Hotmart, R$ 37), o produto em teste; o Desafio 7 em 7 (R$ 47) está parado. A aba Ajustes, se preenchida, manda.
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
    {
      // Quiz Diva (03/11): cada tela do quiz conta como um bloco; a capa (promessa) é a página (quiz-p1 … quiz-p5).
      // O quiz informa a tela atual em window.plBloco; o botão de compra leva sck=quiz-pN para a Greenn.
      id: 'quiz',
      nome: 'Quiz Diva',
      dominio: 'michelesalla.com.br',
      outrosDominios: ['quiz.michelesalla.com.br', 'clientes-phi-six.vercel.app', 'painel.michelesalla.com.br'],
      prefixo: 'quiz',
      paginas: [['quiz-p1', 'P1 · Rotina de 5 minutos'], ['quiz-p2', 'P2 · Barriga estufada à noite'], ['quiz-p3', 'P3 · Sem mil abdominais'],
        ['quiz-p4', 'P4 · Depois dos 40'], ['quiz-p5', 'P5 · Se deixou pra depois']],
      // telas 01 a 22 do quiz, na ordem (michele-salla/quiz/quiz.js)
      blocos: ['Capa (promessa + idade)', 'Michele', 'Objetivo', 'Barriga no dia', 'Recomeços', 'Abdominal', 'Hipopressivo',
        'Prova (alunas)', 'Rotina', 'Sinais', 'Fase', 'Identificação', 'Analisando 1', 'Sabotador', 'Medo', 'Sonho',
        'Tempo por dia', 'Motivo', 'Analisando 2', 'Resultado (perfil)', 'Oferta'],
      blocosOferta: [22],
      botoes: {},
    },
    {
      // Quiz Pilates em Casa (05/11, fase 1 do teste): quiz.michelesalla.com.br/?p=1..5. Mesma lógica do Quiz Diva:
      // cada tela é um bloco (01 capa com a idade … 19 oferta; até 06/11 a idade era a tela 02) e cada promessa é uma página (pilates-p1 … pilates-p5).
      id: 'pilates',
      nome: 'Quiz Pilates',
      dominio: 'quiz.michelesalla.com.br',
      outrosDominios: ['clientes-phi-six.vercel.app'],
      prefixo: 'pilates',
      paginas: [['pilates-p1', 'P1 · Depois dos 40'], ['pilates-p2', 'P2 · Sem impacto'], ['pilates-p3', 'P3 · Sem estúdio'],
        ['pilates-p4', 'P4 · Plano personalizado'], ['pilates-p5', 'P5 · A rotina da Michele'], ['pilates-p6', 'P6 · Dores e emagrecer 45+']],
      // telas 01 a 24 do quiz (michele-salla/quiz-pilates/pilates.js). Desde 13/11 entraram altura, peso e peso desejado (12–14),
      // compromisso (18) e nome (21); a oferta passou de 19 para 24. Visitas antes de 13/11 seguem a numeração antiga (01–19).
      blocos: ['Capa (promessa + idade)', 'Michele', 'Objetivo', 'Já fez pilates', 'O que incomoda', 'Impacto', 'Prova (alunas)',
        'Rotina', 'Tempo por dia', 'Onde pratica', 'Fase', 'Altura', 'Peso', 'Peso desejado', 'Identificação', 'Analisando 1',
        'Recomeços', 'Compromisso', 'Medo', 'Sonho', 'Nome', 'Analisando 2', 'Resultado (perfil + IMC)', 'Oferta'],
      blocosOferta: [24],
      botoes: {},
      gateway: 'Hotmart',
    },
  ] as SiteCfg[],
}
