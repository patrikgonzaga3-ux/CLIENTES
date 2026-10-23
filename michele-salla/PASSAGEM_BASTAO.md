# Michele Salla · cérebro do projeto (Desafio 7 em 7)

**Leia isto inteiro antes de responder qualquer coisa sobre a Michele.** Junto com o `CLAUDE.md` da raiz
(regras e padrão de campanha) e o `michele-salla/painel/CLAUDE.md`.

**Mantenha atualizado:**
- ao fim de cada conversa, ou quando algo mudar, edite este arquivo e dê commit/push;
- seção 7 (pendências) e seção 8 (diário).

Nada de senha, token ou dado de cliente aqui.

Última atualização: 23/10/2026.

---

## 1. Quem é quem
- **Patrik:** dono da agência; decide tudo. Desde 23/10 o Claude da nuvem cuida de tudo sozinho.
  - O "Claude do PC" (Windows) faz só a última rodada de pendências (seção 7) e depois **não mexe mais**.
- **Cliente:** Michele Salla (CNPJ 32.983.139/0001-99, Veranópolis/RS).
  - Produto: **Desafio 7 em 7**, R$ 67 ou 12x de R$ 6,89.
- **Repositório:** `patrikgonzaga3-ux/CLIENTES`, branch main. Commit com
  `git -c user.name=Claude -c user.email=noreply@anthropic.com commit`, depois `git push origin main`.

## 2. Mapa de contas e IDs
| O quê | Valor |
|---|---|
| Página de vendas (no ar) | https://michelesalla.com.br/desafio7em7-a/ · WordPress página 10264 · Elementor, versão F |
| Checkout (Greenn) | produto **199167**, oferta **1qsr9k** · `https://payfast.greenn.com.br/199167/offer/1qsr9k` |
| Portfólio do Meta (Business) | "MM Seca Barriga Mãe" · business_id **658778173061454** |
| Conta de anúncio | `[CA] Michele Salla Seca Barriga Mãe` · **act_1619523595475963** |
| **Pixel / conjunto de dados** | **991344998762063** "Pixel - Michele Salla" (único da conta; cookie primário ligado) |
| **Evento de conversão das campanhas** | **Compra (PURCHASE)** nesse pixel. Vem da Greenn (navegador + API de conversões) |
| Página do Facebook | "Michele Salla PAB" · **262689970269678** (final 9678) |
| Instagram | **@michelesalla** · **17841465706978287** (ligado à conta de anúncio em 23/10) |
| Usuário do sistema (token do painel) | "Paineldelucro" · 61595833678500 · só "Ver desempenho" na conta |
| Painel de Lucro | https://painel.michelesalla.com.br/painel · código em `michele-salla/painel/` |
| Banco do painel | Supabase "patrikgonzaga3-ux's Project" · ref **jratrlmlvguxtwevgzfc** (conector Supabase_Clientes) |
| Hospedagem do painel | Vercel, time **"Ptk midias"** (o conector Vercel desta sessão ainda NÃO vê esse time) |
| Domínio | TurboCloud (cPanel pelo botão "Logar no cPanel"). DNS só com o Patrik |
| Webhook da Greenn | `https://painel.michelesalla.com.br/api/webhook/greenn?token=<WEBHOOK_TOKEN da Vercel>` |

## 3. Como o rastreio funciona (fluxo)
```
Anúncio (UTM: utm_source=FB, utm_medium={{placement}}, utm_campaign={{campaign.name}},
         utm_content={{ad.name}}, utm_term={{adset.id}})
  → Página michelesalla.com.br/desafio7em7-a
      · PixelYourSite: PageView (navegador + API de conversões)
      · widget do rodapé: CliqueComprar (1x por visita, 67 BRL) — michele-salla/desafio-7em7/rastreio/initiate-checkout.js
      · [FALTA INSTALAR] rastreio.js do painel: tempo por bloco, rolagem, cliques, tempo até comprar → pl_comportamento
  → Checkout Greenn (payfast.greenn.com.br)
      · pixel da Greenn: ViewContent, AddToCart, InitiateCheckout, AddPaymentInfo, **Purchase** (navegador + API de conversões)
      · webhook da Greenn → painel (/api/webhook/greenn) → pl_eventos → pl_compras
```
- A página **não** manda InitiateCheckout (decisão do Patrik em 23/10: o oficial é o da Greenn).
- **GTM não resolve a compra:** a compra acontece no domínio da Greenn, então quem manda o Purchase é a Greenn.
  GTM só mudaria como a página manda PageView/CliqueComprar, que já funcionam.
- Um produto da **Hotmart** da Michele também manda eventos para esse pixel (pay.hotmart.com).

## 4. O que o painel mostra e de onde vem
| Aba / dado | Fonte | Situação em 23/10 |
|---|---|---|
| Lucro, meta do mês, dia a dia, por gateway, por produto, mês a mês | webhook Greenn (`pl_compras`) − custos (`pl_gastos_painel`) − gasto Meta | vendas OK; gasto Meta **vazio** (sem token) |
| Anúncios · funil 3x | Meta (`pl_meta_conjuntos`, `pl_meta_anuncios`): gasto, cliques, IC, compras | **vazio até ter META_ACCESS_TOKEN** |
| Página (tempo de bloco, rolagem, cliques, tempo até comprar) | `rastreio.js` → `pl_comportamento` | **vazio: linha não instalada na página** |
| Recuperar vendas | PIX/boleto gerado, recusada e abandono do webhook (`pl_abandonos`) | depende do webhook mandar esses eventos |
| Ajustes | `pl_ajustes` + `pl_gastos_painel` (tudo editável) | 10 custos lançados |
| Acessos | `pl_usuarios`, `pl_convites` | admin + 1 convidada OK |
| Fontes | `pl_fontes` | mostra a última leitura de cada fonte |

- **Funil 3x** (ticket R$ 67): custo por clique ≤ 4% (R$ 2,68), por checkout ≤ 23% (R$ 15,41), por compra ≤ 45% (R$ 30,15).
- **Atualização:**
  - robô Supabase `painel-robos-hora` (pg_cron, minuto 7 de cada hora), criado em 23/10.
    Lê a senha `cron_secret` do Vault. **Sem a senha ele recebe 401.**
  - reserva: cron da Vercel 1x/dia às 09:00 UTC, mais o botão "Atualizar".
- **Status da Greenn que o painel entende:**
  - aprovada (paid);
  - aguardando (waiting_payment, pix_created, billet…);
  - recusada (refused);
  - reembolsada (refunded);
  - chargeback;
  - abandono (lead/checkout abandonado).
- **Compra de teste:** cadastrar o e-mail em `pl_emails_teste` antes, para não contar como venda.

## 5. Receita: subir uma campanha (padrão do Patrik)
Ferramentas Meta Ads (MCP), conta 1619523595475963.

**Campanha:**
- `ads_create_campaign`: objetivo OUTCOME_SALES; ABO (sem orçamento na campanha); nome `PTK - <dd/mm do início> - <NOME>`.

**Conjunto, um por criativo** (`ads_create_ad_set`):
- billing_event IMPRESSIONS; optimization_goal OFFSITE_CONVERSIONS; destination_type WEBSITE;
- promoted_object `{"pixel_id":"991344998762063","custom_event_type":"PURCHASE"}`;
- daily_budget = 45% da oferta em centavos (R$ 67 → 3015); bid_strategy LOWEST_COST_WITHOUT_CAP;
- start_time com -03:00;
- targeting `{"geo_locations":{"countries":["BR"]},"age_min":30,"age_max":55,"genders":[2]}`
  (o Meta grava Advantage+ com idade 30–55 como sugestão);
- nome `CONJ - ADV+ - <criativo>`.

**Criativo** (`ads_create_creative`):
- page_id 262689970269678; instagram_user_id 17841465706978287; video_id + miniatura (image_url = `picture` do vídeo);
- **sem message e sem headline**; call_to_action LEARN_MORE;
- link_url `https://michelesalla.com.br/desafio7em7-a/?utm_source=FB&utm_medium={{placement}}&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.id}}`.

**Anúncio** (`ads_create_ad`): nome = nome do criativo.

**Ligar:**
- tudo criado PAUSADO;
- mostrar a estrutura inteira ao Patrik (nomes, verba, público, criativos);
- só ativar com o OK dele.

Os vídeos precisam estar **na conta de anúncio** (`ads_get_ad_videos`). A biblioteca do portfólio
("Business creatives") não aparece para a ferramenta. Para subir por URL, o link precisa ser público e direto.

## 6. Campanha atual
`PTK - 26/10 - ABO TESTE DE CRIATIVO` (120252298837110047), tudo **PAUSADO**. Início 26/10 às 00:03.

| Conjunto | ID | Anúncio | Vídeo |
|---|---|---|---|
| CONJ - ADV+ - M 1 | 120252298841550047 | M 1 (falta) | M - (1).mp4 (falta subir na conta) |
| CONJ - ADV+ - M 2 | 120252298848880047 | M 2 (falta) | M - (2).mp4 |
| CONJ - ADV+ - M 3 | 120252298849850047 | M 3 (falta) | M - (3).mp4 |
| CONJ - ADV+ - M 4 | 120252298850690047 | M 4 (falta) | M - (4).mp4 |
| CONJ - ADV+ - M 5 | 120252298852060047 | M 5 (falta) | M - (5).mp4 |

Os vídeos estão na pasta "MICHELE LOW" da biblioteca do portfólio, 1080x1920.

## 7. Pendências (na ordem)
1. **Compra não chegou nem no Meta nem no painel.**
   - A compra de teste de 23/10 chegou até o AddPaymentInfo (~11h); depois disso não veio nada:
     nem Purchase no pixel, nem aviso no webhook (nem "aguardando").
   - Os dois mudos ao mesmo tempo indicam: compra não aprovada, OU webhook/pixel da Greenn sem o produto 199167
     ou sem os eventos certos.
   - Até 23/10 o webhook só recebeu o teste de exemplo da Greenn (transação "100", R$ 397, oferta "FiBR18"),
     marcado como teste.
   - **Para fechar:** uma compra aprovada (PIX pago) com e-mail em `pl_emails_teste`, e conferir as duas pontas.
2. **Vídeos M 1–M 5 na conta + criar os 5 anúncios** (receita da seção 5).
3. **Instalar o rastreio do painel na página** (widget HTML no rodapé da página 10264):
   - com OK do Patrik para mudar o link do checkout:
     `<script async src="https://painel.michelesalla.com.br/rastreio.js" data-slug="desafio7em7-a" data-checkout="sim"></script>`
   - sem mexer no checkout: a mesma linha sem `data-checkout="sim"`.
   - `data-checkout="sim"` acrescenta ao link da Greenn, no clique: utm_term, src, utm_content, utm_campaign,
     utm_medium, fbclid e sck=desafio7em7-a. Isso deixa ver qual anúncio vendeu e melhora o casamento da compra
     no Meta (fbc da Greenn em só 17%).
   - Testado de ponta a ponta em 23/10 (a visita chegou em `pl_comportamento`). A página tem 16 blocos na ordem do config.
   - Depois de instalar: `python3 tools/wp_michele.py conferir` tem que dar tudo OK (9 itens).
4. **Token do Meta no painel:**
   - Michele cria o app "Painel de Lucro Michele" no portfólio.
   - O app entra no usuário do sistema "Paineldelucro" e gera um token ads_read sem validade.
   - O token vai para META_ACCESS_TOKEN na Vercel; também META_AD_ACCOUNT_ID=1619523595475963. Depois, redeploy.
5. **Senha do robô:** CRON_SECRET na Vercel e o mesmo valor no Vault do Supabase
   (`select vault.create_secret('<senha>','cron_secret');` no SQL Editor).
6. **Acesso do Claude da nuvem a tudo** (para não depender mais do PC):
   - variáveis do ambiente `WP_URL`, `WP_USUARIO`, `WP_SENHA_APP` (o `tools/wp_michele.py` já lê do ambiente);
   - conector Vercel com o time "Ptk midias";
   - (opcional) token da Greenn da Michele.
7. Confirmar na Greenn: oferta 1qsr9k aprovada (não "Em análise") e conta bancária da Michele cadastrada.
8. Depois:
   - webhook da Hotmart;
   - importar vendas antigas;
   - aba Fontes mostrar que os custos vêm de Ajustes;
   - verificação do domínio michelesalla.com.br no Meta.

## 8. Diário
- **23/10:**
  - página F publicada e conferida;
  - pixel e Greenn mandando eventos (exceto Purchase, nunca visto);
  - painel no ar com login e convites;
  - Instagram ligado à conta;
  - campanha e 5 conjuntos criados pausados;
  - robô pg_cron criado (espera a senha);
  - rastreio do painel testado, mas não instalado.
  - **Erros do Claude, assumidos com o Patrik:**
    - deu o rastreio por "OK" sem uma compra aprovada de ponta a ponta;
    - tratou o teste de exemplo do webhook da Greenn como prova de que o webhook estava certo;
    - deixou o rastreio da página, o token do Meta e o robô como "pendências" sem dizer que o painel estava incompleto;
    - não garantiu acesso próprio à Greenn, à WordPress e à Vercel da Michele.

## 9. Como trabalhar
- Sempre em português, frases curtas. Nunca pedir senha ou token no chat; dizer onde colar.
- Checkout, preço, oferta, link de compra e configuração da Greenn: só com OK explícito do Patrik para a mudança mostrada.
- Conferência rápida do estado:
  - página: `python3 tools/wp_michele.py conferir`;
  - pixel: `ads_get_dataset_stats` (991344998762063);
  - banco: `pl_eventos`, `pl_compras`, `pl_comportamento`, `pl_fontes`, `cron.job`.
- O `delete` no Supabase às vezes estoura o tempo. Use `with d as (delete … returning 1) select count(*) from d`.
- Teste de navegador: o site da Michele derruba o Chromium daqui. Sirva a página salva com `ctx.route`
  e use `executablePath: '/opt/pw-browsers/chromium'`.
