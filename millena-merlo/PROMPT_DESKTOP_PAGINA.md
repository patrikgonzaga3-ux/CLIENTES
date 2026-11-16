---
type: padrao
title: "Prompt Desktop - Página Millena no molde da Efeito Lipo C"
project: "Millena Merlo"
tags: [tipo/padrao, projeto/millena-merlo, prompt, elementor, pagina-de-vendas]
created: 2026-11-16
updated: 2026-11-16
summary: "Prompt para o Claude do computador do Patrik montar a página /oferta da Millena no WordPress dela, copiando o modelo Elementor da efeitolipo.com.br/c (página 388)."
---

# Prompt para o Claude Desktop (copiar daqui para baixo)

Você vai montar uma página de vendas no WordPress da cliente **Millena Merlo** (desafiomagrapromax.com.br), usando como molde
**exato** a página **efeitolipo.com.br/c** (WordPress + Elementor, página ID 388, outro site da agência). Responda sempre em português.
Use o navegador deste computador, onde o Patrik está logado (Hostinger/hPanel e os dois WordPress). Se pedir login, pare e chame o Patrik.

## Fontes (leia antes)
- Repositório GitHub **patrikgonzaga3-ux/CLIENTES**, branch **claude/wonderful-brown-345heu**:
  - `millena-merlo/pagina-desafio/index.html` → **todo o texto aprovado**, bloco a bloco (é a fonte da cópia; o visual dele NÃO vale).
  - `millena-merlo/PLANO_PAGINA_E_VSL.md` → estudo das respostas do quiz, pensamentos, pendências.
- Referência visual: abra https://efeitolipo.com.br/c no celular (390 px) e no computador. **O design, espaçamentos, fontes, tamanhos,
  componentes e animações têm que ficar iguais.** Só mudam textos, fotos e cores.

## Regras
1. Não invente texto, número, depoimento ou promessa. O que estiver como `(CONFIRMAR …)` ou `(ESCREVER AQUI …)` no index.html fica
   assim na página (destacado em amarelo) até a Millena responder.
2. Não mexa na página da efeitolipo (só "salvar como modelo"). No site da Millena não mexa em menus, página inicial, outras páginas,
   plugins, tema, DNS nem no quiz (quiz.desafiomagrapromax.com.br).
3. Não use fotos, ícones ou selos hospedados em laurarosapersonal.com nem fotos da Laura. Tudo que for imagem sobe na Biblioteca de
   Mídia da Millena.
4. Nunca copie senhas para arquivos, GitHub ou chat.

## Passo 1 · Copiar o molde
1. efeitolipo.com.br/wp-admin → Páginas → página da URL /c (ID 388) → **Editar com Elementor**.
2. Setinha ao lado de **Publicar/Atualizar** → **Salvar como modelo** → nome `Molde EL C`. Feche sem salvar nada na página.
3. wp-admin → **Modelos → Modelos salvos** → no `Molde EL C`, **Exportar modelo** (baixa um .json).

## Passo 2 · Criar a página no site da Millena
1. desafiomagrapromax.com.br/wp-admin → **Modelos → Modelos salvos → Importar modelos** → envie o .json.
2. **Páginas → Adicionar nova**: título `Oferta Desafio Magra Pro Max`, link permanente `oferta`, **Modelo de página: Elementor Canvas**.
   Salve como **rascunho** → **Editar com Elementor** → ícone de pasta → **Meus modelos** → inserir `Molde EL C`.
3. Confira que o molde ficou igual ao da efeitolipo (fontes, espaçamentos, animações). Se a fonte ou o CSS personalizado não vierem,
   copie das Configurações do site / CSS personalizado da efeitolipo (página 388 e Configurações do site).

## Passo 3 · Cores (um laranja só)
- Onde a efeitolipo usa **verde** (blocos de cor, faixas, cartão de preço) → **preto #111111**.
- Onde usa **laranja** (botões, destaques, setas, ícones) → **laranja da Millena #F85A00** (tirado da capa dela; confirme com o
  conta-gotas no logo e na capa). Não use outro laranja.
- Fundo creme e branco ficam como estão. Texto sobre preto: branco.

## Passo 4 · Blocos (ordem final) e de onde vem cada texto
Use os componentes da efeitolipo; onde ela não tem o bloco, **duplique um bloco parecido dela** e troque o texto.
1. Topo — sobrancelha, promessa, subtítulo, estrelas + "12.000 transformações", "Feito para você que" (4 pílulas), foto grande de
   antes e depois, botão **que desce direto ao cartão de preço** (âncora no bloco da oferta).
2. Antes e depois (carrossel de cartões da efeitolipo) — 8 fotos + print do grupo, legenda "Aluna do Desafio Magra Pro Max".
3. Pensamentos — balões em volta de uma foto (como na efeitolipo). Use os 7 pensamentos do index.html. Foto: uma da Millena ou,
   se não houver adequada, deixe só os balões (não use imagem de IA da Laura).
4. "A culpa não é sua. É o método." + caixa "Agora eu te pergunto…" (ícone de alerta laranja).
5. "Com o Desafio Magra Pro Max, você vai:" — 6 benefícios no cartão com ícone da efeitolipo (troque os ícones por ícones simples
   laranja da Biblioteca de ícones do Elementor).
6. **3 passos** (bloco do Maxxima) — duplique o estilo dos cartões de entrega da efeitolipo, numerados 1, 2, 3.
7. "Tudo o que você precisa…" — cartões de entrega com imagem no topo (use a capa/mockup do desafio e fotos da Millena treinando).
8. "Esse desafio foi feito para você que:" + "pelo menos 2 itens".
9. "Recapitulando" — mesma tabela da efeitolipo, **sem preço por item** (não temos); só "Tudo isso valeria R$ 197".
10. Cartão de preço — capa do desafio, "Tudo isso valeria R$ 197", "Por apenas 12x de R$ 3,08", "ou (CONFIRMAR) à vista", botão
    **QUERO COMEÇAR MEU DESAFIO**, "Acesso imediato · Garantia de (21 ou 30?) dias", 3 selos (refaça com ícones do Elementor).
11. **Como você recebe** (Maxxima) — 3 passos curtos.
12. **Me responda só a verdade** (Maxxima) + "Agora você tem duas opções" (componente da efeitolipo).
13. Garantia.
14. Quem é a Millena — foto, nome, "Criadora do Desafio Magra Pro Max", história (pendente), frase final e a **VSL** (widget HTML):
    `<vturb-smartplayer id="vid-6a1d7c05f819e44f4c81322b" style="display:block;margin:0 auto;width:100%"></vturb-smartplayer>`
    `<script>var s=document.createElement("script");s.src="https://scripts.converteai.net/9406f62d-bd68-44a6-971a-c0a91bdff3c8/players/6a1d7c05f819e44f4c81322b/v4/player.js";s.async=!0;document.head.appendChild(s);</script>`
15. Cartão de preço de novo.
16. Perguntas (acordeão da efeitolipo) e rodapé com o aviso de resultados (sem CNPJ; não temos o dela).

## Passo 5 · Imagens em boa qualidade
- Peça ao Patrik a pasta com os **originais** (antes e depois, fotos da Millena, capa/mockup). Se não houver, baixe do quiz na maior
  resolução (abra cada link e salve; não comprima de novo):
  - antes e depois: `https://imagedelivery.net/709sUuPaO4NBreJR-qFQLA/<ID>/public` com os IDs
    5e648370-8341-4af2-e6e9-eaaeee9fee00, 3b85e630-5720-4b11-3903-0a2fadd4e200, 8f662caf-d7ba-473d-d41e-76cfecc50f00,
    9d614122-1ee8-47e5-b78e-b4235e7fff00, b7fa83d6-5f3d-44f0-b046-673fd0d96b00, afabbf3f-9a31-4047-f93b-3c7ca398e600,
    71f85bbc-8406-4a91-c78c-e23c73a5a400, 1153a0c9-6e33-405a-2817-95363c023500
  - print do grupo: 7988b2b4-d3da-485b-d63d-c06ed2231f00 · Millena na academia: 2c2ceba2-3159-417d-2ed5-dbc2077d5900 ·
    capa do desafio: 9875dc7b-ab5c-4f0f-7774-5ddccf50cd00 · logo: 53902717-2b09-45ca-023c-af4b2cc8bd00
  - Se `/public` não abrir, use `/width=1600,quality=95` no lugar.
- Suba na Biblioteca de Mídia da Millena em WebP ou JPG de boa qualidade (largura 1080–1600 px).

## Passo 6 · Botões, pixel e rastreio
- Todos os botões de compra: link `https://payfast.greenn.com.br/redirect/286218` e **classe CSS `checkout`**.
- Antes de pôr o pixel, veja no código-fonte da página se o pixel **1332309708403614** já carrega no site (não duplicar).
  Se não carrega, coloque um widget HTML no fim da página com o script do fim do `index.html`
  (fbq init 1332309708403614 + PageView, CliqueComprar 1x por visita e o repasse dos parâmetros utm/fbclid para o checkout).

## Passo 7 · Conferir e publicar
1. Visualize no celular (390 px) e no computador lado a lado com a efeitolipo.com.br/c. Tem que parecer a mesma página com outra marca.
2. O Patrik autorizou publicar em 16/11: **Publicar** com o link `desafiomagrapromax.com.br/oferta/`.
3. Teste no celular: abre, vídeo toca, botão do topo desce ao preço, botões vão ao checkout levando `?utm_source=teste`,
   o pixel dispara (Meta Pixel Helper ou Testar eventos do Gerenciador).
4. Ative a não indexação se houver opção (Elementor/configurações da página); se não houver, avise.

## Passo 8 · Para o Claude da nuvem conseguir editar depois
No WordPress da Millena: **Usuários → seu usuário → Senhas de aplicativo** → criar `Claude nuvem`. **Não cole a senha em lugar
nenhum.** Avise o Patrik que ela existe; ele vai salvar pelo formulário seguro da sessão na nuvem (host `desafiomagrapromax.com.br`,
tipo usuário e senha).

## Ao terminar
- Mande ao Patrik: link, prints do celular (topo, pensamentos, preço, Millena) e a lista do que ficou pendente.
- Atualize `millena-merlo/PLANO_PAGINA_E_VSL.md` (seção Pendências) e a nota `01-Projetos/Millena Merlo - Desafio Magra Pro Max.md`
  do Obsidian, com commit na branch `claude/wonderful-brown-345heu` de cada repositório.
