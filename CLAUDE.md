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
- **HTML da prévia:** edite `_modelo.html` ou `styles.css` e rode `python3 build.py` (gera A–D).
- **Elementor:** `elementor/gerar_elementor.py` gera `desafio-7em7-A.json` … `D.json` (um container por bloco).
- **WordPress da Michele:** use a skill `wordpress-michele` (`.claude/skills/wordpress-michele/SKILL.md`)
  e o script `tools/wp_michele.py`. O acesso fica no `.env` (nunca no GitHub).

- **Bloco 06:** os 4 pensamentos ficam dentro da foto do espelho (`foto-espelho-pensamentos*.webp`; a E tem o balão da canetinha).
- **Bloco 11:** 7 cartões com foto (`cartao-*.webp`, avatar gerado no Canva); a E troca os cartões 3 e 6.

## Rastreio (pixel do Meta)
- O pixel **991344998762063** já está no site todo pelo plugin **PixelYourSite** (PageView, com API de conversões).
- Os botões de compra têm a classe `botao-compra`. O código `michele-salla/desafio-7em7/rastreio/initiate-checkout.js`
  (vai num widget HTML no rodapé da página) envia **InitiateCheckout** uma vez por visita, com valor 67 BRL.
- **Purchase** é configurado pelo Patrik na plataforma de pagamento. Não mexer.

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
