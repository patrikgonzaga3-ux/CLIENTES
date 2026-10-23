# Montar o Painel de Lucro para um cliente

Para o Claude que vai montar: siga as etapas na ordem. Cada etapa diz o que conferir antes de seguir. O que depender de
acesso que você não tem, peça ao Patrik e siga com o resto; no fim liste o que ficou pendente.

## Prompt único (o Patrik preenche e manda)

```
Monte o Painel de Lucro deste cliente a partir do modelo:
pasta modelo-cliente do repositório patrikgonzaga2-tech/LR_LauraRosaPersonal (branch main; se a pasta ainda
não estiver na main, use a branch claude/lucid-ride-58o0q9). Siga o modelo-cliente/docs/ONBOARDING_CLIENTE.md
na ordem, sem pular testes, e me responda em português.

CLIENTE
- Nome do negócio: ____________
- Produto principal e preço (ticket): ____________ (R$ ___)
- Outros produtos que contam (order bump, upsell, assinatura): ____________ (ou "todos do gateway")
- Metas do funil 3x: clique __% · initiate checkout __% · compra __% do ticket (padrão 4 / 23 / 45)
- Meta de lucro do mês: R$ ______ (ou "está na planilha")

ONDE FICA
- Repositório do painel: ____________ (ou "crie um novo, privado, chamado painel-<cliente>")
- Banco (Supabase) do cliente: projeto ____________ (já existe? sim/não)
- Vercel: projeto ____________ (ou "crie") · domínio do painel: ____________

FONTES
1. Gateway: ____________ (Greenn / Hotmart / Kiwify) · nº dos produtos: ______
2. Conta de anúncio do Meta: ____________ · token do usuário do sistema (ads_read): vou colar na Vercel
3. Planilha de gastos: link ____________ (abas "Gastos" e "Configuração" no modelo? sim/não)
4. Páginas de venda: ____________ (endereços e plataforma: WordPress/Elementor, Lovable, outra)

ENTREGA
- Painel no ar no domínio, com senha, conferido no celular.
- Aba Fontes de dados toda "ok" (ou o que falta, explicado).
- Lucro do mês batendo com o extrato do gateway e a planilha (me mostre a conta).
- Texto pronto para o cliente: linha de rastreio para colar nas páginas e parâmetros de URL dos anúncios.
- Lista do que ficou pendente e do que precisa do meu OK.
Não mexa em checkout, preço ou campanha do cliente sem o meu OK.
```

---

## O que o cliente precisa ter (peça antes, se faltar)

| # | Acesso | Para quê | Obrigatório |
|---|---|---|---|
| 1 | Gateway (Greenn, Hotmart ou Kiwify) com acesso para cadastrar webhook | vendas, pedidos, reembolsos, Pix parado, abandono | sim |
| 2 | Conta de anúncio do Meta + usuário do sistema da BM com **ads_read** nela | gasto, cliques, initiate checkout | sim |
| 3 | Planilha de gastos (Google Sheets) com as abas **Gastos** e **Configuração** (modelo em `modelo/*.csv`) | custos, impostos, meta de lucro | sim |
| 4 | Projeto Supabase (pode ser o que o cliente já tem: as tabelas têm prefixo `pl_`) | guardar tudo | sim |
| 5 | Projeto na Vercel + domínio (ex.: painel.cliente.com.br) | painel no ar | sim |
| 6 | Acesso para colar 1 linha nas páginas de venda | comportamento na página | recomendado |
| 7 | Parâmetros de URL nos anúncios (abaixo) | ligar venda ao anúncio | recomendado |

## Etapas

### 1. Repositório do cliente
- Repositório novo e privado (`painel-<cliente>`) com o **conteúdo** da pasta `modelo-cliente/` na raiz (não a pasta
  em si). Sem histórico do repositório da Laura.
- `npm install` e `npm test` (os testes precisam passar antes de seguir).
- Se não conseguir criar o repositório, peça ao Patrik para criar um vazio e use-o.

### 2. `cliente.config.ts`
- `nome`, `gateways`, `produtos` (vazio = todos os produtos do gateway contam; para o cliente que vende outras coisas
  no mesmo gateway, liste só os ids deste painel), `ticket`, `funil3x`, `metaLucroMes`, `impostoMetaPct`
  (padrão 12,5%: confirmar com o contador), `taxaGatewayPct` (só para gateway que não manda o líquido).
- `sites`: 1 por domínio de página de vendas. `dominio` sem https e sem www; `prefixo` curto (ex.: `loja`);
  `paginas` = `[['loja-a', 'Página A'], …]`; `blocos` = nomes das seções da página na ordem (pode ficar vazio:
  o painel numera); `blocosOferta` = números dos blocos com preço e botão.
- A aba Configuração da planilha, quando preenchida, vale mais que meta, ticket, impostos e metas daqui.

### 3. Banco (Supabase)
- Rodar `supabase/schema.sql` no projeto do cliente (ferramenta do Supabase / migração `painel_lucro`, ou SQL Editor).
  Não apaga nada do que o cliente já tem.
- Conferir: as tabelas `pl_*` e a view `pl_compras` existem; `anon` não lê nenhuma delas.
- Compras de teste: `insert into pl_emails_teste (email, nota) values ('email@do-teste', 'teste');`

### 4. Vercel e domínio
- Projeto ligado ao repositório. Variáveis de `.env.example` (gere `PAINEL_SENHA`, `WEBHOOK_TOKEN` e `CRON_SECRET`
  longos e aleatórios; passe a senha do painel ao Patrik por mensagem, nunca em arquivo).
- Domínio: na Vercel, adicionar o domínio do painel; no DNS do cliente, o registro que a Vercel pedir (normalmente
  CNAME `painel` → `cname.vercel-dns.com`). Conferir o https.
- Primeiro deploy com `DEMO=1` é uma boa forma de ver o painel no ar (senha `demo`); depois tire o `DEMO`.

### 5. Gateway (webhook)
- URL: `https://<painel>/api/webhook/<greenn|hotmart|kiwify>?token=<WEBHOOK_TOKEN>` (a aba Fontes mostra pronta).
- Greenn: Ferramentas → Webhooks, eventos de venda (todos os status) + lead/abandono. Hotmart: Ferramentas → Webhook,
  versão 2, eventos de compra + abandono de carrinho (o hottok pode ir em `HOTMART_HOTTOK`). Kiwify: Apps →
  Webhooks, todos os eventos.
- Teste: uma compra de teste (e-mail em `pl_emails_teste`) ou o botão de teste do gateway. Conferir em `pl_eventos`
  e na aba Fontes ("último aviso…").
- **Kiwify:** a leitura foi escrita pela documentação. Na 1ª venda real, confira em `pl_eventos.raw` se valor,
  líquido, status e rastreio caíram certo; se não, ajuste `lib/gateways.ts` (e anote no Histórico).
- Vendas antigas do mês: se o gateway exportar planilha, importe para `pl_eventos` (status `aprovada`, `valor`,
  `liquido`, `transacao`, `data_aprovacao`, `event_key` = `import-<transacao>`), para o lucro do mês já fechar.

### 6. Meta
- `META_ACCESS_TOKEN` = token do usuário do sistema da BM do Patrik com ads_read na conta do cliente;
  `META_AD_ACCOUNT_ID` = número da conta. Se as campanhas otimizam por evento personalizado, `META_EVENTO_COMPRA`.
- Teste: botão Atualizar no painel → aba Fontes, linha Gasto do Meta "ok" com o gasto dos últimos dias.

### 7. Planilha de gastos
- Abas com estes nomes exatos: **Gastos** (Mês | Grupo | Descrição | Tipo | Valor | Recorrente) e **Configuração**
  (Item | Valor). Modelo: `modelo/planilha-gastos.csv` e `modelo/planilha-configuracao.csv`.
  - Tipo: `fixo` (R$ no mês) ou `%` (sobre o faturamento). Recorrente `sim` = repete nos meses seguintes até uma
    linha nova da mesma despesa (valor 0 encerra). Mês: `2026-11`, `11/2026` ou `nov/2026`.
  - O gasto com anúncio do Meta **não** entra na planilha (vem da conta).
- Leitura, opção 1 (recomendada): conta de serviço do Google (`GOOGLE_SERVICE_ACCOUNT_JSON` + `PLANILHA_ID`); o
  cliente compartilha a planilha como Leitor com o e-mail que a aba Fontes mostra.
  Opção 2: publicar cada aba como CSV (`PLANILHA_CSV_GASTOS`, `PLANILHA_CSV_CONFIG`); quem tiver o link vê os valores.
- Teste: Atualizar → Fontes, linha Planilha "ok" com o nº de gastos; aba Lucro mostra os custos na conta.

### 8. Robô de hora em hora
- Supabase → Database → Extensions: ligar `pg_cron` e `pg_net`. Depois rodar a linha que a aba Fontes mostra
  (`cron.schedule('painel-lucro-hora', …)`). A Vercel ainda roda 1x por dia (vercel.json) como reserva.
- Teste: em até 1 hora, Fontes mostra leitura nova do Meta e da planilha sem clicar em Atualizar.

### 9. Rastreio nas páginas de venda
- A aba Fontes mostra a linha pronta de cada página: `<script async src="https://<painel>/rastreio.js" data-slug="loja-a" data-checkout="sim"></script>`
  (antes de `</body>`, ou num bloco HTML do Elementor). `data-checkout="sim"` leva o rastreio do anúncio para o
  checkout (é o que liga a venda ao anúncio); combine com o Patrik antes, porque mexe no link de compra.
- Blocos: `data-bloco="01"`, `"02"`… em cada seção (no Elementor: Avançado → Atributos, ou a classe `elb-01`). Sem
  marcação, o rastreio conta as seções de cima da página, na ordem.
- Teste: abrir a página pelo celular com `?utm_source=FB&utm_term=123` → aba Comportamento mostra a visita em até 1 min.

### 10. Anúncios
- Parâmetros de URL de todo anúncio: `utm_source=FB&utm_medium={{placement}}&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.id}}`

### 11. Conferência final (antes de entregar)
1. `npm test` e o build da Vercel verdes.
2. Aba Fontes: tudo "ok" (ou explicado).
3. Lucro do mês: faturamento e nº de vendas batem com o extrato do gateway no mesmo período (± vendas de teste);
   custos batem com a planilha. Mostre a conta ao Patrik.
4. Anúncios: o gasto do período bate com o Gerenciador de Anúncios.
5. Painel aberto no celular (390 px): sem texto cortado, tabelas arrastando.
6. Senha funcionando; sem senha não abre nada; o webhook sem token responde 401.

### 12. Entrega (mensagem ao Patrik)
- Link do painel e onde está a senha (nunca no texto do repositório).
- O que está ligado e o que ficou pendente (com o que falta de quem).
- Texto pronto para o cliente: linha de rastreio por página, parâmetros de URL, como preencher a planilha.

## Histórico
- 23/10/2026: modelo criado a partir do painel da Laura Rosa (Lucro, funil 3x, comportamento na página, recuperação).
