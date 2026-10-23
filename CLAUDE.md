# CLIENTES · projetos de clientes do Patrik

Responda sempre em português (Brasil), em todas as mensagens.

## Michele Salla · Desafio 7 em 7
Página de vendas do Desafio 7 em 7 (cliente Michele Salla, site `michelesalla.com.br`, WordPress + Elementor Pro).

- **Pasta:** `michele-salla/desafio-7em7/`
- **Prévia (Vercel, só revisão, sem indexar):** https://clientes-phi-six.vercel.app
- **Versões:** A e B usam foto real de aluna; C e D usam avatar (sem o texto "Imagem ilustrativa", a pedido do Patrik).
  A e C prometem "Perca até 7cm de barriga em 7 dias…"; B e D, "Chega de se sentir mal diante do espelho".
  E = C (avatar) com promessa e ruminações adaptadas da página Desafio Efeito Mounjaro da Michele
  ("Reduza até 7 cm de barriga sem gastar R$3.000 com canetinhas" + 6 ruminações).
- **Versão F = página única que vai ao ar** (endereço `desafio7em7-a`, página 10264): base E + etiqueta
  "Pensando em gastar R$500 por mês com canetinha?", promessa "Descubra como perder até 7 cm de barriga em 7 dias sem gastar
  R$500 por mês com canetinha", pílulas (Sem canetinha · 15 min · medidas), 6 ruminações mistas C+E, oferta com
  "ou 12x de R$ 6,89" (valor do checkout da Greenn) e "Mais de 7x mais barato que 1 mês de canetinha"; no início das 2 ofertas, o título "Descubra como perder até -7cm de barriga em 7 dias sem gastar R$500 por mês com canetinha". Ancoragem: canetinha ≈ R$500/mês (dado do Patrik).
- **Link de compra (todas as versões):** https://payfast.greenn.com.br/199167/offer/1qsr9k (checkout Greenn, R$ 67 ou 12x R$ 6,89).
- **Celular:** letras, espaços e ícones menores só no celular (bloco `@media (max-width:767px)` no fim do `styles.css` e
  `compactar_celular()` no gerador do Elementor). O computador não muda.
- **HTML da prévia:** edite `_modelo.html` ou `styles.css` e rode `python3 build.py` (gera A–D).
- **Elementor:** `elementor/gerar_elementor.py` gera `desafio-7em7-A.json` … `D.json` (um container por bloco).
- **WordPress da Michele:** use a skill `wordpress-michele` (`.claude/skills/wordpress-michele/SKILL.md`)
  e o script `tools/wp_michele.py`. O acesso fica no `.env` (nunca no GitHub).

- **Bloco 06:** os 4 pensamentos ficam dentro da foto do espelho (`foto-espelho-pensamentos*.webp`; a E tem o balão da canetinha).
- **Bloco 11:** 7 cartões com foto (`cartao-*.webp`, avatar gerado no Canva); a E troca os cartões 3 e 6.

## Rastreio (pixel do Meta)
- O pixel **991344998762063** já está no site todo pelo plugin **PixelYourSite** (PageView, com API de conversões).
- Os botões de compra têm a classe `botao-compra`. O código `michele-salla/desafio-7em7/rastreio/initiate-checkout.js`
  (vai num widget HTML no rodapé da página) envia o evento personalizado **CliqueComprar** uma vez por visita (67 BRL).
- **InitiateCheckout, AddPaymentInfo e Purchase** saem da **Greenn** (produto 199167, navegador + API de conversões).
  A página não manda InitiateCheckout, para não contar a mesma pessoa 2 vezes (decisão do Patrik em 23/10).
- Configuração da Greenn (pixel, eventos, momento do Purchase) é do Patrik. Não mexer sem o OK dele.

## Regras
1. **Nada vai ao ar sem o OK do Patrik.** Páginas novas são criadas como **rascunho**. Publicar,
   trocar a página inicial, mexer em menus, plugins, tema ou domínio: só com o OK dele.
2. **Pagamento e checkout:** links de compra (`#LINK-DE-COMPRA`), preços, ofertas e parcelamento
   só mudam com aprovação explícita do Patrik para a mudança mostrada (arquivo, antes/depois).
3. **Não invente texto, número, depoimento ou promessa.** Se faltar algo, deixe
   `(ESCREVER AQUI: o que seria)` e pergunte.
4. Fotos de antes e depois: só as do próprio Desafio 7 em 7. Não usar as que têm banner
   "Resultado Aluna PAB" (outro programa), nem as `QANTES*` (são as mesmas fotos do PAB).
5. Nunca mostre, copie ou envie a senha do `.env`.
6. Não usar o CNPJ da Corpo Feliz. O da Michele é 32.983.139/0001-99 (Veranópolis/RS).

## Domínio
O domínio da Michele está na TurboCloud. A página do Desafio fica dentro do site
(`michelesalla.com.br/<endereço>`), então não precisa mexer em domínio. Qualquer mudança de DNS só com o Patrik.

## Campanhas no Meta (padrão do Patrik, 23/10)
- **Nomes:** campanha `PTK - <data de início dd/mm> - <nome da campanha>`; conjunto `CONJ - <público> - <nome do criativo>`;
  anúncio `<nome do criativo>`. Ex.: `PTK - 26/10 - ABO TESTE DE CRIATIVO` · `CONJ - ABERTO - CRIATIVO 1` · `CRIATIVO 1`.
- **"ABO testadora de criativos" (estrutura 1-1-1):** 1 campanha (objetivo Vendas, orçamento no conjunto/ABO);
  1 conjunto por criativo, cada um com 1 anúncio só (nº de conjuntos = nº de criativos).
  - Conjunto: orçamento de **45% do valor da oferta** (Desafio R$ 67 → R$ 30,15/dia); público Advantage+, aberto ou
    seguidores do Instagram; idade e gênero da persona; posicionamentos Advantage+.
  - Criativo: imagem ou vídeo; **sem texto** (o Patrik nunca usa texto principal/título); link = página de vendas.
- **Parâmetros de URL** em todo anúncio: `utm_source=FB&utm_medium={{placement}}&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.id}}`
- Nada é criado ou ligado na conta de anúncio sem o OK do Patrik para a estrutura mostrada (nomes, verba, público, criativos).

## Passagem de bastão
**Antes de qualquer resposta sobre a Michele, leia `michele-salla/PASSAGEM_BASTAO.md` (o cérebro do projeto):** contas e IDs, pixel 991344998762063 com evento de conversão **Compra**, receita de campanha, o que o painel mostra e pendências. Ao fim de cada conversa, atualize as seções 7 (pendências) e 8 (diário) e faça commit/push.
