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
| Usuário do sistema (token do painel) | "Paineldelucro" · 61595833678500 · só "Ver desempenho" na conta · fica na BM **"MM Seca Barriga Mãe" (1343252016358384)** |
| App do token | **PAINEL DE LUCRO MICHELE** · 1662092225703327 · BM "MM Seca Barriga Mãe" (criado pela Michele em 23/10) |
| Outra BM da Michele | "BM 01 Matriz - Michele Seca Barriga" · 658778173061454 (sem apps) |
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
      · rastreio.js do painel (instalado 23/10, data-checkout="sim"): tempo por bloco, rolagem, cliques, tempo até comprar → pl_comportamento
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
Criada por completo em 23/10. **Ligar só com o OK do Patrik** (`ads_activate_entity` na campanha, nos conjuntos e nos anúncios).

| Conjunto | ID conjunto | Anúncio (ID) | Criativo | Vídeo (ID) | Original no Drive |
|---|---|---|---|---|---|
| CONJ - ADV+ - M 1 | 120252298841550047 | M 1 (120252299554780047) | 996185936071196 | 1004045772726853 | Katy (1:21) |
| CONJ - ADV+ - M 2 | 120252298848880047 | M 2 (120252299555350047) | 1152046750598417 | 2631542297279859 | Óculos |
| CONJ - ADV+ - M 3 | 120252298849850047 | M 3 (120252299558480047) | 1864492678303572 | 1636535638121939 | Vestido |
| CONJ - ADV+ - M 4 | 120252298850690047 | M 4 (120252299560310047) | 4738161556508362 | 1584415789578266 | Conversa |
| CONJ - ADV+ - M 5 | 120252298852060047 | M 5 (120252299561400047) | 1549012913914500 | 1639483727920671 | Piscina |

Em todos os anúncios:
- página 262689970269678 e Instagram 17841465706978287;
- sem texto, botão "Saiba mais";
- link da página com os UTM do padrão.

**Capas:** `https://painel.michelesalla.com.br/capas/mN.jpg` (pasta `michele-salla/painel/public/capas/`, 1º quadro de cada vídeo).

**Como os vídeos foram subidos:** pela URL direta do Drive da Michele, pasta "Criativos" 1Q8X3HZl8SAP7EiSQLyussp2FCDXI4fmL,
que já tem link público: `https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t`.
Os M da pasta "MICHELE LOW" são esses mesmos vídeos. Mapa conferido pelos quadros e pelas durações.

**Painel publica sozinho:** todo push na main do CLIENTES gera deploy na Vercel ("Ptk midias") em ~1 min.

## 7. Pendências (na ordem)
1. **Compra não chegou nem no Meta nem no painel.**
   - A compra de teste de 23/10 chegou até o AddPaymentInfo (~11h); depois disso não veio nada:
     nem Purchase no pixel, nem aviso no webhook (nem "aguardando").
   - Os dois mudos ao mesmo tempo indicam: compra não aprovada, OU webhook/pixel da Greenn sem o produto 199167
     ou sem os eventos certos.
   - Até 23/10 o webhook só recebeu o teste de exemplo da Greenn (transação "100", R$ 397, oferta "FiBR18"),
     marcado como teste.
   - **Para fechar:** uma compra aprovada (PIX pago) com e-mail em `pl_emails_teste`, e conferir as duas pontas.
2. ~~Vídeos e anúncios~~ FEITO em 23/10 (seção 6). Falta só o OK do Patrik para ligar.
3. **Instalar o rastreio do painel na página** — Patrik escolheu **COM data-checkout** (23/10).
   - Já está no gerador (`gerar_elementor.py`, widget do rodapé junto do CliqueComprar) e nos JSONs A–F.
   - **Falta só gravar na página 10264:** `python tools/wp_michele.py atualizar-pagina --id 10264 --versao F`
     (a gravação pelo PC foi barrada pela permissão automática do Claude Code). Depois: `conferir` tem que dar 9 OK.
   - A última gravação manual da página (23/10 11:28) veio deste gerador; regravar a F não perde nada.
4. **Token do Meta no painel:** (23/10: app JÁ CRIADO — PAINEL DE LUCRO MICHELE 1662092225703327, na BM 1343252016358384.
   Falta: Configurações > Apps > o app > Atribuir pessoas > marcar "Paineldelucro (System user)" > Controle total >
   Atribuir; depois Usuários do sistema > Paineldelucro > Gerar token (app PAINEL DE LUCRO MICHELE, ads_read, Nunca expira).
   O Claude do PC foi barrado na atribuição pela permissão automática.)
   - 23/10 noite: Patrik ligou o app ao Paineldelucro (Controle total). Na Vercel já existem META_AD_ACCOUNT_ID e
     CRON_SECRET, mas **ainda não existe META_ACCESS_TOKEN** (pl_fontes "meta": falta META_ACCESS_TOKEN).
   - Conferido de novo às 18:10 de 23/10: Vault já tem `cron_secret`; Vercel segue SEM META_ACCESS_TOKEN (6 variáveis,
     nenhuma compartilhada); página ainda SEM rastreio.js (conferir: 8 OK, falta 1); webhook sem evento novo.
   - **18:27 de 23/10: META_ACCESS_TOKEN na Vercel + redeploy → pl_fontes "meta" OK** (conta 1619523595475963 lida;
     0 linhas porque a campanha está pausada). Item 4 FEITO.
   - **18:35 de 23/10: página 10264 regravada pelo Patrik (versão F com rastreio.js COM data-checkout).
     `conferir` = 9 OK; 1 visita de teste (utm_source=teste-claude, logada como admin) chegou em pl_comportamento.** Item 3 FEITO.
   - Ainda falta: um aviso novo da Greenn no webhook (teste pelo ícone de raio do evento de venda paga).
   - Michele cria o app "Painel de Lucro Michele" no portfólio.
   - O app entra no usuário do sistema "Paineldelucro" e gera um token ads_read sem validade.
   - O token vai para META_ACCESS_TOKEN na Vercel; também META_AD_ACCOUNT_ID=1619523595475963. Depois, redeploy.
5. ~~Senha do robô~~ FEITO em 23/10:
   - a senha foi gerada dentro do Supabase e está só no Vault (`cron_secret`); o sha256 dela está em `pl_segredos` (chave 'cron');
   - `/api/cron` aceita o CRON_SECRET da Vercel OU essa senha;
   - teste: 200 (Meta "não configurado" até ter o token; planilha não é usada, os custos vêm de Ajustes).
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

9. **Quiz Diva (03/11):** Michele dizer a idade (capa 1 e gancho 2), aprovar promessas e perfis e gravar os ganchos;
   Patrik dar OK no quiz e na oferta, escolher onde o quiz fica (WordPress em rascunho ou endereço próprio) e na campanha.
   Rastreio LIGADO (03/11): aba **Quiz Diva** em https://painel.michelesalla.com.br/painel/quiz (telas 01–22 = blocos; quiz-p1..p5 = páginas).

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
  - **Última rodada do Claude do PC (23/10, noite):**
    - rastreio do painel COM data-checkout pronto no gerador; gravação na página barrada (falta 1 comando);
    - webhook segue só com o teste de exemplo da Greenn (nenhuma compra real chegou);
    - extensão do Chrome desconectada: Greenn, wp-admin (senha "Claude nuvem"), vídeos M 1–M 5 e app do Meta não feitos;
    - vídeos M ainda não estão na conta de anúncio nem no PC.
  - **Refeito com o Chrome (23/10, noite):**
    - Greenn: a compra de teste (fatura 10278251, 23/10 11:03) está **PAGA**, líquido R$ 62,66.
      Mesmo paga, não chegou no webhook nem virou Purchase no pixel → o problema é a configuração da Greenn.
    - Greenn: aviso "Ação pendente: cadastre sua conta bancária" → conta bancária da Michele **não** cadastrada.
    - Greenn: não consegui abrir as configurações do produto (menu "Opções" barrado pela permissão automática;
      endereço direto dá 404). Webhook e pixel do 199167 seguem **sem conferir**.
    - WordPress: senha de aplicação "Claude nuvem" criada (o Patrik copiou da tela; vai para WP_SENHA_APP da nuvem).
    - Meta: portfólio 658778173061454 hoje se chama "BM 01 Matriz - Michele Seca Barriga"; **nenhum app** adicionado
      (o "Painel de Lucro Michele" não existe). A pasta "MICHELE LOW" não está na Biblioteca de mídia desse portfólio.
    - Vercel "Ptk midias" abre no Chrome; CRON_SECRET e token não foram colados (o Claude não digita segredo em campo).

  - **Claude da nuvem (23/10, noite):**
    - 5 vídeos subidos do Drive;
    - capas em alta;
    - 5 criativos e 5 anúncios criados (pausados);
    - robô de hora em hora funcionando sem a Vercel.

  - **Decisão do Patrik (23/10):** otimizar as campanhas para **Compra**. O CliqueComprar é só métrica de apoio.
    Plano B, se a compra ainda não chegar ao pixel até ligar: trocar os conjuntos para InitiateCheckout (da Greenn)
    por poucos dias e voltar para Compra depois. Nunca otimizar para CliqueComprar.

- **26/10:**
  - **Campanha que está no ar** (criada pelo Patrik no Gerenciador):
    `PTK - 23/10 - ABO TESTE CRIATIVO - VENDAS - 5 CONJ (M1-M5)`, id **120252299198450047**.
    - 5 conjuntos "ABO 1"…"ABO 5", R$ 30,15/dia cada, Compra no pixel 991344998762063, ativos;
    - os UTM dela trazem IDs (utm_campaign = id da campanha, utm_content = id do anúncio, utm_source = ig/fb/th);
    - ~R$ 82 gastos no 1º dia; nenhuma compra no pixel até 22h UTC.
  - A campanha criada pelo Claude (120252298837110047, M 1–M 5) segue **pausada** e duplica essa: não ligar.
    Apagar só com OK do Patrik.
  - Rastreio do painel **instalado** na página (com data-checkout): 116 visitas em `pl_comportamento` no 1º dia.
  - Webhook: chegou outro teste automático da Greenn (transação "303", R$ 67, sck "architecto"); marcado como teste.
  - Foto do bloco 04 (calça aberta) saía do arco roxo:
    - corrigido no gerador (container com overflow hidden e padding 0), commit d36d085;
    - gravado na página 10264 pelo Patrik (PC novo) em 26/10 às 19h50; conferido no ar (overflow hidden, padding 0).
  - O site tem proteção com captcha (recaptcha.cloud) no wp-login e às vezes recusa a conexão da nuvem:
    gravar a página pelo PC (`python tools/wp_michele.py atualizar-pagina --id 10264 --versao F`, sem `!` no PowerShell).
  - `midia-michele.json` (mapa das imagens na Multimídia) agora está no repositório. Nunca rodar `subir-imagens`
    de novo para a página F: duplicaria as fotos.
  - O Patrik mandou a senha da WordPress pelo chat: recomendado trocar a senha e usar senha de aplicativo nas variáveis do ambiente.

- **27/10:**
  - **Preço novo: R$ 47** (12x de R$ 4,83), checkout **E1YMM7** (antes 1qsr9k, R$ 67). Gravado e conferido no ar.
    A parcela foi calculada pela taxa da oferta antiga; confirmar no checkout se a Greenn mostrar outro valor.
  - CliqueComprar agora com valor 47; ticket do painel 47 (metas do funil 3x: clique R$ 1,88, checkout R$ 10,81, compra R$ 21,15).
  - Página mais enxuta (`compactar_geral()` no gerador):
    - espaço dos blocos −38%, vão entre itens −25%;
    - ondas de 40/20 px;
    - botão 15 px, preço −20%.
  - A prévia da Vercel agora corta a foto da calça no arco, igual à WordPress.
  - **Decisão do Patrik:** a verba dos anúncios continua como está (R$ 30,15/dia por conjunto), mesmo com o preço em R$ 47.
  - O domínio "efeitolipo21.com.br" não existe; a referência de layout é efeitolipo.com.br/a.

- **30/10 · Diagnóstico da 1ª campanha** (relatório: https://claude.ai/artifact/Eyc2xFsCSqJarBDmZSr56k):
  - Campanha 120252299198450047, de 26 a 29/10, **pausada** em 29/10.
    - R$ 403,05 gastos; 24.656 impressões; 953 cliques no link; 391 visitas (Meta) ou 627 (painel).
    - 3 aberturas de checkout, 1 checkout iniciado, 0 vendas. A Greenn não mandou nenhum aviso desde 23/10.
  - **Causas, por peso:**
    1. Público aberto: 18–65 anos, todos os gêneros, Advantage+ sem sugestão. 69% da verba foi para homens e 38% para 55+.
    2. Posicionamentos automáticos: Audience Network = 300 cliques (31%), 0 na oferta. FB Reels e o sobreposto = 403 cliques, 0 checkout.
       As 3 aberturas de checkout e o único checkout iniciado vieram do Instagram (Feed e Stories).
    3. Quebra de mensagem. Os vídeos falam de festa/viagem/evento em 7 dias e vestido; a página abre com canetinha e avatar
       ("festa/viagem/evento/vestido" = 0 vezes na página).
       Só 8,6% passam da 1ª tela (Efeito Lipo /b 34%, 21D 41%); mediana de tempo ativo 0,6 s; 77% saem em menos de 5 s.
    4. Oferta só no bloco 11 de 16: 6 visitas (1%) viram o preço. **O preço (67 → 47) não foi a causa.**
    5. Vídeos de 51 a 81 s, média assistida de 4 a 8 s; 7,6% chegam a 25%.
       Qualidade "abaixo da média" nos 5 anúncios.
  - **Melhores sinais:**
    - AD4: 2 aberturas de checkout + o único checkout iniciado; 16% das visitas ficaram 15 s ou mais.
    - AD1: 1 abertura de checkout, conversão "acima da média".
    - AD3: 3 visitas na oferta.
    - AD2 (82% dos cliques de apps) e AD5 (88% homens) foram os piores.
    - A ligação AD↔vídeo M não é visível pela API (são posts da página): confirmar no Gerenciador.
  - **Plano sugerido (aguarda OK do Patrik):**
    1. Mulheres 30–55, público original.
    2. Posicionamentos manuais (IG Feed/Stories/Reels + FB Feed/Stories).
    3. Versão G da página com a 1ª tela do evento/vestido + foto real da Michele + fotos reais de alunas + botão.
    4. Botão de compra cedo.
    5. Cortes de vídeo de 20–30 s.
    6. Compra de teste PIX antes de religar e token do Meta no painel.
    7. Religar só AD4, AD1 e AD3 com regra de corte (R$ 47 sem checkout ou R$ 94 sem venda).
    8. Manter R$ 47.
  - Metas do próximo teste: mulheres ≥ 90% da verba; visita/clique ≥ 70%; passam da 1ª tela ≥ 30%; chegam à oferta ≥ 10%;
    clicam em comprar ≥ 3%; custo por checkout ≤ R$ 10,81; custo por compra ≤ R$ 21,15 (empate ≈ R$ 37).
- **03/11:** `wp_michele.py teste` OK (michelesalla, administrator). Nada mudou no site. Plano de 30/10 segue aguardando o OK do Patrik.

- **03/11 · Black Diva 2026** (proposta da Michele revisada; relatório: https://claude.ai/artifact/1aP7s3GyRXUuzwHnNR1NbL):
  - **Proposta da Michele:**
    - combo de 3 etapas: Desafio 7 em 7 → Protocolo Mais Leve até o Natal (21 dias) → Universo Diva (12 meses, produto principal);
    - R$ 197 à vista; mentoria individual fora;
    - janela curta com data real; benefício para alunas atuais (extensão de acesso);
    - gancho "Janeiro pode chegar com você já cuidando de si. Sua virada começa com cinco minutinhos."
  - **Página em prévia** (não indexada, não está no WordPress): https://clientes-phi-six.vercel.app/michele-salla/black-diva/
    - arquivo `michele-salla/black-diva/index.html`; pendências marcadas em amarelo (`.pendente` / `.nota-revisao`).
  - **Histórico da conta** (todas as campanhas de venda desde 04/24):
    - R$ 17.151 gastos, 101 compras no pixel, R$ 4.166 de venda registrada (retorno 0,24);
    - DCBD jan/26: vídeos a R$ 92,50 por compra, imagens a R$ 205,28;
    - melhor custo por compra entre R$ 45 e R$ 66 (produtos de R$ 29 a R$ 43);
    - Black 2025 = [BDF] captação para WhatsApp + live (sem venda no pixel); Natal 2025 sem venda.
    - **Correção:** o pixel já teve compras (o relatório de 30/10 dizia que não).
  - **Sugestões:**
    - ancoragem só com preço praticado (alternativa: R$ 16,42 por mês);
    - vendas até 01/12 às 23h59 e Protocolo de 02/12 a 22/12;
    - compra de teste antes de anunciar;
    - alinhar "cinco minutinhos" com as aulas de 15 min;
    - deixar claro o que acontece depois de 12 meses;
    - captação para o grupo VIP de 10 a 25/11 (R$ 40/dia) e venda de 26/11 a 01/12 (R$ 150/dia) para públicos quentes;
    - mulheres de 30 a 55 anos, sem Audience Network, vídeos da Michele.
  - **Contas de R$ 197:** sobra de R$ 155,14 por venda; meta de custo por venda R$ 88,65; empate R$ 155,14.
  - **Falta da Michele:**
    - quanto vendeu a Black 2025;
    - preços praticados do Universo e do Protocolo;
    - plataforma e link do checkout;
    - encontros do Universo;
    - datas;
    - o que acontece depois dos 12 meses;
    - o benefício das alunas atuais;
    - 4 a 6 vídeos.

  - **Slides para apresentar à Michele** (15 slides; baixa em PowerPoint ou PDF): https://claude.ai/artifact/GvCVkV5tTqmaYEdEnhq8Sn
  - Topo da Black Diva trocado pelo antes e depois do Desafio (`hero-antes-depois-avatar.webp`, o mesmo da página do Desafio).
  - **Para levar a página à WordPress** (como RASCUNHO, porque tem pendências), rodar no PC:
    `python tools/wp_michele.py criar-pagina-html --arquivo michele-salla/black-diva/index.html --slug black-diva --titulo "Black Diva"`.
    - Para atualizar depois: `atualizar-pagina-html --id <ID> --arquivo michele-salla/black-diva/index.html`.
    - A página inteira vai num widget HTML do Elementor (modelo Canvas), com as imagens já na Multimídia.

- **03/11 · Quiz Diva** (pedido do Patrik depois da reunião de 2 h com a Michele):
  - **Quiz:** `michele-salla/quiz/` (`quiz.js` = todos os textos, telas, perfis e regra; `index.html` = o quiz).
    Prévia: https://clientes-phi-six.vercel.app/michele-salla/quiz/?p=1 (capas `?p=1` a `5`).
    Painel com o print de cada tela: https://clientes-phi-six.vercel.app/michele-salla/quiz/revisao/ e https://claude.ai/artifact/UUtEikrpunkA3Ht7TSd8aN
  - Modelado no quiz do Efeito Lipo da Laura (07/10 a 01/11: 3.155 sessões, 28,6% passam da capa, 711 resultados, 481 cliques no checkout,
    75 vendas do produto principal + 25 itens extras; conferido no banco em 03/11).
  - **5 promessas = 5 capas** (resto igual): 1 rotina de 5 min da Michele (post com 26.303 cliques); 2 barriga estufada à noite;
    3 sem mil abdominais / técnica certa; 4 depois dos 40 não é falta de esforço; 5 você se deixou pra depois.
  - **22 telas**, 5 perfis por regra (Nova Fase → Estufada → Esforçada → Recomeça → Deixou pra Depois), oferta única do
    Desafio 7 em 7 (R$ 47, E1YMM7) com resposta ao medo da tela 16. Link leva utm/fbclid do anúncio e `sck=quiz-p1..p5`.
  - 20 ganchos (4 por promessa) com frases dos posts da Michele; 3 marcados com risco de reprovação no Meta.
  - Testado: caminho completo até os 5 perfis, 5 capas, voltar, várias respostas, toque duplo, imagens, largura 390 px.
  - **Rastreio do quiz:** o quiz carrega `painel.michelesalla.com.br/rastreio.js` com `data-slug=quiz-pN` e põe a tela atual em
    `window.plBloco` (chama `window.plTique()` antes e depois da troca). Site `quiz` no `cliente.config.ts` (domínios: michelesalla.com.br,
    clientes-phi-six.vercel.app, painel.michelesalla.com.br). A API aceita vários sites no mesmo domínio pelo começo do slug.
    Telas abertas com `?tela=` (painel de revisão) não rastreiam. Se o quiz mudar de endereço, pôr o domínio em `outrosDominios`.
  - **06/11 · Dados do curso (Patrik):** 24 aulas de 20 a 40 min, 365 dias de acesso, garantia 7 dias, módulos 0–4 (Boas-vindas,
    Fundamentos do Pilates Mat, Mat Pilates Essencial sem acessórios, Pilates com Acessórios, Funcional & Mobilidade) e bônus
    (módulos 5 e 6: Pós-Parto; Dor Lombar e Ciático; Hérnia de Disco; Escoliose). Logo em `quiz-pilates/img/logo-pilates-em-casa.webp`.
    Telas "Analisando/Montando" agora seguem sozinhas em ~2,6 s também pelo relatório (o print do Patrik estava parado porque o
    relatório abre com `?tela=`) e o botão fica logo abaixo. Página leve: ~141 KB, abre em ~1,6 s (medido 06/11).
  - **06/11 · Revisão final do quiz do pilates:** 5 testes = 5 promessas (capas p1–p5), 1 conjunto cada. Entrou o aviso de
    saúde no rodapé da oferta (pilates e Desafio). Lista do que pedir à Michele no relatório (seção 5): aulas/minutos/acesso,
    como acessa e se é pagamento único, nomes dos módulos, bônus, garantia, depoimentos, autorização de imagem das alunas,
    revisão dos textos dos perfis, logo. Do Patrik: domínio, webhook Hotmart, pixel na Hotmart, preço R$ 37 no Brasil.
  - **06/11 · Sem migrar (Patrik: "vamos sem migrar"):** fica tudo nas nossas contas. Link do pilates: Hotmart
    https://pay.hotmart.com/K103974189L?off=6lnthlfw, **R$ 37** ("PILATES EM CASA - COM MICHELE SALLA"; a oferta 1exyl0t5 de
    R$ 47 foi trocada pelo Patrik). Verba sugerida por conjunto: R$ 16,65 (45% de R$ 37). Quiz sem nenhuma pendência visível
    (números de aulas/minutos e bônus ficaram de fora até a Michele mandar). Desafio: "funcionais" tirado também do gerador
    da página (falta regravar a 10264 pelo PC). Prompt do PC para o que falta (domínio, webhook Hotmart, página):
    `michele-salla/docs/PROMPT_PC_O_QUE_FALTA.md`. Pixel na Hotmart: o Patrik confere.
  - **06/11 · Migração para as contas da Michele (pedido do Patrik):** roteiro e prompt para o Claude do PC em
    `michele-salla/docs/MIGRAR_PARA_CONTAS_DA_MICHELE.md` (Supabase novo na org dela + Vercel transferida + convites para o Patrik;
    o antigo fica de reserva). Atenção: Vercel Hobby não aceita membros; para compartilhar, a equipe dela precisa ser Pro.
  - **06/11 · Material da Michele** (Drive do Patrik, pasta 19ndLn2JpuMD1VM67vPtJIBaSb_ZVT5fw: FOTOS + HISTORIA/"MINHA HISTÓRIA.docx"):
    produto **Pilates em Casa** (nasceu na pandemia; fundamentos, aulas clássicas, peso do corpo, acessórios opcionais bola/flex ring/
    theraband/overball, aulas para lombar, cervical, ciático, hérnia, escoliose, pós-parto); Michele especialista em pilates desde 2005,
    estúdio com o marido. Quiz preenchido com isso; fotos reais em `quiz-pilates/img/`. Capa 5 virou "Há quase 20 anos eu vivo o
    pilates todos os dias…" (frase dela). **Falta:** nº de aulas/minutos/acesso, bônus, garantia, parcelamento, link Hotmart R$ 47,
    depoimentos, webhook Hotmart, domínio (Vercel + cPanel).
  - **05/11 · Decisões do Patrik:** manter 7 dias; Desafio só com hipopressivo + áudio (tirado "funcionais" do quiz; a página 10264
    no WordPress ainda fala em funcionais: regravar pelo PC quando ele pedir); ManyChat já ajustado por ele; **fase 1 do teste =
    PILATES (R$ 37 desde 06/11)**; endereço **quiz.michelesalla.com.br**.
    - Quiz Pilates: `michele-salla/quiz-pilates/` (`pilates.js` = textos; motor e estilo compartilhados em `michele-salla/quiz/motor.js`
      e `estilo.css`). 5 capas (`?p=1..5`), 20 telas, 5 perfis (Nova Fase, Sem Impacto, Postura, Recomeça, Vai Começar Agora).
      Tudo do produto (nome, módulos, acessórios, garantia, fotos de alunas, link da Hotmart) está em `[[ ]]` amarelo: o produto
      de pilates NÃO está público (nem site, nem Hotmart pública) e não há venda nem campanha de pilates na conta. A Michele manda.
    - Revisão para a Michele: https://clientes-phi-six.vercel.app/michele-salla/quiz-pilates/revisao/
    - Endereço: `vercel.json` já reescreve quiz.michelesalla.com.br (raiz = pilates, `/desafio/` = Desafio). Faltam: adicionar o
      domínio no projeto da prévia na Vercel (time "Ptk midias", o conector não vê) e o CNAME `quiz` no cPanel da TurboCloud (DNS
      ns1/ns2.luke9050.com.br; sem acesso daqui).
    - Pixel 991344998762063 no quiz só em quiz.michelesalla.com.br (PageView + CliqueComprar). Purchase vem da Hotmart (pixel no produto).
    - Painel: aba **Quiz Pilates** (`/painel/pilates`, site `pilates`, slugs pilates-p1..p5, sck igual). Falta o webhook da Hotmart.
  - **Ajustes da Michele (04/11, WhatsApp):** idade 45 na capa 1 e no gancho 2; telas "Analisando…" seguem sozinhas em ~3,5 s
    (o botão continua; quem volta não é empurrada); resultado com corpo e mente (texto dela: cinturão natural + "pensamentos e
    hábitos que fazem você desistir de si mesma" + Mente Magra e Diva + "Quinze minutinhos… Uma tarefa por dia…"), botão
    "Quero começar meus 7 dias". **Em aberto (decisão Patrik/Michele):** 7 × 21 dias, tirar os funcionais e deixar só
    hipopressivo + áudio (muda texto de oferta: regra de pagamento), ajuste do ManyChat (não disse qual).
  - **Pilates asiático (04/11):** página "Pilates Asiáticos 28 dias" (1147500708457430) com 8 anúncios ativos na Biblioteca desde
    07–11/08, todos "Avaliação máxima ⭐ Descubra seu plano personalizado AGORA" (quiz), cobrança em USD; "Protocole Naturel" igual.
    Reverse Health: "28-Day Asian Pilates Challenge", mulheres 40+, quiz de 1 minuto, 15–20 min, barriga, core e postura.
    A Michele não tem campanha nem venda de pilates na conta/painel: falta saber o produto dela (conteúdo, preço, checkout).
  - **Capa (03/11, pedido do Patrik):** foto da Michele trocada pelo antes e depois do Desafio (`hero-antes-depois-avatar.webp`) nas 5 capas.
  - **Checagem dos 3 filtros do Patrik (03/11):** todos os números reconferidos na fonte. Corrigido "≈100 vendas" → 75 do produto
    principal. Posts da Michele são impulsionamentos de CLIQUE (não venda). P5 tem o maior CTR da conta ("Deixa eu te lembrar", 13,53%);
    P4 tem a prova mais fraca ("Atenção Mulher", 43 cliques, CTR 1,72%). Tirados textos sem fonte ("quiz de 1 minuto", "mil abdominais
    estufam"). Michele precisa confirmar que faz a rotina de 5 min / hipopressivo todo dia e revisar o "trava" de cada perfil.
  - Plano de teste sugerido: 1 ABO com 5 conjuntos (1 por promessa) a R$ 21,15, mulheres 30–55, sem Audience Network, evento Compra.

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
