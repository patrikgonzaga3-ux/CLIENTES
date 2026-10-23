# Painel de Lucro · modelo de cliente

Painel com link e senha que mostra, sozinho, quanto o cliente lucrou e por quê. Uma cópia deste modelo por cliente
(banco, painel e senha só dele).

| Aba | O que mostra |
|---|---|
| Lucro | faturamento → taxas → anúncios → impostos → custos → lucro; margem; projeção do mês × meta; ROAS e ROAS de empate; dia a dia; por produto; mês a mês |
| Anúncios · funil 3x | custo do clique, do initiate checkout e da compra contra as metas (padrão 4%, 23%, 45% do ticket), por campanha, conjunto e anúncio |
| Comportamento na página | gargalo da visita até a venda; tempo em cada bloco; onde param; dúvidas do FAQ; toques fora de botão; tempo até comprar; por anúncio, página, posicionamento e aparelho |
| Recuperar vendas | Pix parado, cartão recusado e checkout abandonado de quem não comprou depois, com WhatsApp |
| Fontes de dados | se cada conexão está funcionando + linhas prontas (webhook, rastreio, parâmetros de URL, robô) |

De onde vêm os dados: **gateway** (webhook, na hora: Greenn, Hotmart, Kiwify) · **Meta** (robô de hora em hora) ·
**planilha de gastos** (robô de hora em hora) · **página de vendas** (`/rastreio.js`, a cada 10 s de visita).

- Montar para um cliente: [`docs/ONBOARDING_CLIENTE.md`](docs/ONBOARDING_CLIENTE.md) (o prompt único está no topo).
- O único arquivo que muda por cliente: [`cliente.config.ts`](cliente.config.ts). Variáveis: [`.env.example`](.env.example).
- Banco: [`supabase/schema.sql`](supabase/schema.sql) (tabelas `pl_*`, não mexe no que o cliente já tem).
- Demonstração sem dados reais: `npm run demo` (senha `demo`), ou `DEMO=1` na Vercel.
- Testes: `npm test` (conta do lucro, gateways com avisos reais, planilha).
