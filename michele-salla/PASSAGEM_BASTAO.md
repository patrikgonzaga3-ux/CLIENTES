# Passagem de bastão · Michele Salla (Desafio 7 em 7)

Atualizado em 23/10/2026. Leia junto com o `CLAUDE.md` da raiz (regras, padrão de campanha) e o
`michele-salla/painel/CLAUDE.md`. Nada de senha, token ou dado de cliente neste arquivo.

## 1. O que está no ar
- **Página de vendas:** https://michelesalla.com.br/desafio7em7-a/ (página 10264, versão F, publicada).
  - Promessa "Descubra como perder até 7 cm…".
  - Oferta R$ 67 ou 12x de R$ 6,89; link Greenn `https://payfast.greenn.com.br/199167/offer/1qsr9k`.
  - Conferir com `python3 tools/wp_michele.py conferir` (8 itens, sem senha).
- **Pixel 991344998762063:** PageView pelo PixelYourSite e CliqueComprar pelo widget do rodapé.
  - Da Greenn chegam ViewContent, AddToCart, InitiateCheckout e AddPaymentInfo, com nota 8 a 8,7.
  - **Purchase ainda não apareceu**, porque não teve venda real. Conferir na 1ª venda.
  - Um produto da Hotmart da Michele também manda eventos para esse pixel.
- **Painel de Lucro:** https://painel.michelesalla.com.br/painel
  - Código em `michele-salla/painel/`. Vercel no time "Ptk midias" (o conector Vercel daqui não enxerga esse time).
  - Supabase "patrikgonzaga3-ux's Project", ref `jratrlmlvguxtwevgzfc`.
  - Login por e-mail e senha. Admin: patrikgonzaga2@gmail.com, já entrou. 1 convidada já criou acesso.
  - Webhook da Greenn OK. A venda de teste (transação "100") está marcada como teste.
  - Custos em `pl_gastos_painel` (10 linhas, editáveis na aba Ajustes).

## 2. Campanha no Meta (tudo PAUSADO, nada ligado)
Conta `[CA] Michele Salla Seca Barriga Mãe`, act_1619523595475963.
- **Página:** "Michele Salla PAB", 262689970269678 (final 9678).
- **Instagram:** @michelesalla, 17841465706978287. Já ligado à conta de anúncio pelo Claude do PC em 23/10.
- **Campanha:** `PTK - 26/10 - ABO TESTE DE CRIATIVO`, id 120252298837110047.
  - Vendas, ABO, sem orçamento na campanha.
- **5 conjuntos:** R$ 30,15/dia cada (45% de R$ 67). Início 26/10 às 00:03 (horário de Brasília).

  | Conjunto | ID |
  |---|---|
  | `CONJ - ADV+ - M 1` | 120252298841550047 |
  | `CONJ - ADV+ - M 2` | 120252298848880047 |
  | `CONJ - ADV+ - M 3` | 120252298849850047 |
  | `CONJ - ADV+ - M 4` | 120252298850690047 |
  | `CONJ - ADV+ - M 5` | 120252298852060047 |

  Configuração igual nos 5:
  - Público: Brasil, Advantage+, sugestão de mulheres 30–55 (o Meta grava idade mínima fixa 25).
  - Otimização: compra (PURCHASE) no pixel 991344998762063.
  - Atribuição: 7 dias clique / 1 dia visualização.
- **Faltam os 5 anúncios.** Um por conjunto, com o nome igual ao do vídeo: M 1 … M 5.
  - Vídeos: pasta "MICHELE LOW" da biblioteca do portfólio (M - (1).mp4 … M - (5).mp4, 1080x1920).
    A ferramenta do Meta daqui só vê vídeos que já estão **na conta de anúncio**.
    O Claude do PC está baixando os 5 e subindo na conta com os nomes M 1 … M 5. Ele devolve os IDs.
  - Em cada anúncio:
    - vídeo + miniatura;
    - **sem texto** (sem texto principal e sem título), botão LEARN_MORE ("Saiba mais");
    - link `https://michelesalla.com.br/desafio7em7-a/`;
    - Instagram 17841465706978287;
    - parâmetros `utm_source=FB&utm_medium={{placement}}&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.id}}`.
  - Criar pausado. Mostrar a estrutura inteira ao Patrik e **só ativar com o OK dele**.

## 3. Pendências (em ordem)
1. **Anúncios M 1–M 5:** esperar os IDs dos vídeos (Claude do PC), criar, mostrar, ativar só com OK.
2. **Rastreio do painel na página (tempo de bloco, cliques, tempo até comprar):** ainda NÃO está na página.
   - Testado de ponta a ponta em 23/10: a visita chegou em `pl_comportamento` com blocos, rolagem e clique.
     O teste foi apagado. A página tem 16 blocos na ordem do `cliente.config.ts`.
   - Linha proposta, num widget HTML no rodapé da página 10264:
     `<script async src="https://painel.michelesalla.com.br/rastreio.js" data-slug="desafio7em7-a" data-checkout="sim"></script>`
   - `data-checkout="sim"` acrescenta ao link da Greenn, no clique: utm_term, src, utm_content, utm_campaign,
     utm_medium, fbclid e sck=desafio7em7-a. Isso muda o link de checkout, então **precisa do OK explícito do Patrik**.
   - Pedido feito em 23/10, ainda sem resposta. A alternativa é colocar a linha sem `data-checkout`.
3. **Token do Meta no painel** (gasto, cliques, IC, compras por anúncio e funil 3x):
   - A Michele cria o app "Painel de Lucro Michele" no portfólio MM Seca Barriga Mãe.
   - Depois o Claude do PC: adiciona o app ao usuário do sistema "Paineldelucro" (61595833678500),
     gera um token ads_read sem validade, o Patrik cola em META_ACCESS_TOKEN na Vercel e faz redeploy.
   - Conferir também META_AD_ACCOUNT_ID = 1619523595475963.
   - Metas do funil 3x (ticket R$ 67): clique ≤ R$ 2,68 (4%), checkout ≤ R$ 15,41 (23%), compra ≤ R$ 30,15 (45%).
4. **Atualização de hora em hora:** hoje é só o cron da Vercel, 1x/dia às 09:00 UTC, mais o botão "Atualizar".
   - pg_cron e pg_net não estão ligados no Supabase.
   - Precisa de CRON_SECRET: o Patrik gera e cola na Vercel e no Vault do Supabase (nunca no chat).
5. **Confirmar com o Patrik:** a oferta 1qsr9k saiu de "Em análise" na Greenn? A Michele cadastrou a conta bancária?
6. **Depois:** webhook da Hotmart, importar vendas antigas, aba Fontes mostrar que os gastos vêm de Ajustes,
   verificação do domínio michelesalla.com.br no Meta.

## 4. Como trabalhar
- Repositório `patrikgonzaga3-ux/CLIENTES`, branch main.
  Commit com `git -c user.name=Claude -c user.email=noreply@anthropic.com commit`, depois `git push origin main`.
- WordPress: skill `wordpress-michele` + `tools/wp_michele.py` (senha no `.env` do PC, nunca no chat).
- Banco: conector Supabase_Clientes (projeto jratrlmlvguxtwevgzfc).
  O `delete` às vezes estoura o tempo; use `with d as (delete … returning 1) select count(*) from d`.
- Teste de navegador: o site da Michele derruba a conexão do Chromium daqui.
  Sirva uma cópia salva da página com `ctx.route` e use `executablePath: '/opt/pw-browsers/chromium'`.
- O Patrik usa um "Claude do PC" (Windows, com Chrome). Para tarefas de tela, mande um prompt pronto para ele colar.
- Sempre em português, frases curtas. Nunca pedir senha ou token no chat.
