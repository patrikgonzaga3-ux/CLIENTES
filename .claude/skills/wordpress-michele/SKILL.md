---
name: wordpress-michele
description: Mexer no WordPress/Elementor da Michele Salla (michelesalla.com.br) pela API, com a senha de aplicação do .env. Use para criar ou atualizar a página do Desafio 7 em 7 no Elementor, subir imagens para a Multimídia ou listar páginas. Sempre como rascunho; publicar só com o OK do Patrik.
---

# WordPress da Michele Salla

Site: `https://michelesalla.com.br` · WordPress 7 · Elementor 4 + Elementor Pro · tema Hello Elementor.
Acesso: senha de aplicação do usuário `michelesalla`, guardada no `.env` da raiz do repositório.

## Antes de tudo
1. Confira se existe o `.env` com `WP_URL`, `WP_USUARIO` e `WP_SENHA_APP`. Se não existir, peça para o
   Patrik copiar `.env.exemplo` para `.env` e colar a senha. **Nunca peça a senha no chat.**
2. Rode `python tools/wp_michele.py teste`. Tem que aparecer `OK: conectado como …`.
   - Erro 401: senha errada ou revogada. Peça uma nova (passo a passo em `kit-claude-pc/LEIA-ME.md`).
   - Erro 406/403: o site recusou a chamada (firewall). Avise o Patrik.

## Criar a página do Desafio no Elementor
1. Gere os JSONs atualizados: `python michele-salla/desafio-7em7/elementor/gerar_elementor.py`
2. Suba as imagens (só as que faltam): `python tools/wp_michele.py subir-imagens`
3. Confira se o snippet **"Claude · gravar Elementor por API"** está ativo no Code Snippets.
   O código está em `michele-salla/desafio-7em7/elementor/snippet-claude-elementor.php`.
   Se não estiver, peça para o Patrik colar (Snippets → Adicionar novo → PHP → "Executar em todo lugar" → Ativar).
4. Crie a página como rascunho:
   `python tools/wp_michele.py criar-pagina --versao A --slug desafio7em7-a`
   (a página nasce no modelo "Elementor Canvas", sem o cabeçalho/rodapé do tema).
5. Mande ao Patrik o link "Editar no Elementor" e a prévia. Ele confere e decide se publica.

Para regravar o layout numa página que já existe: `python tools/wp_michele.py atualizar-pagina --id ID --versao A`.
Depois de gravar, o script salva a página de novo para limpar o cache do WP Rocket.

## Conferir a página no ar
`python tools/wp_michele.py conferir` abre https://michelesalla.com.br/desafio7em7-a/ como visitante e confere
promessa, parcelamento (12x de R$ 6,89), os 3 botões com o link da Greenn, o rastreio e o pixel. Não precisa de senha.
A página oficial é a 10264 (`desafio7em7-a`, versão F).

## Alternativa sem snippet (importar pela tela)
No painel: **Templates → Templates salvos → Importar templates** → escolha `desafio-7em7-A.json` →
**Importar agora**. Depois crie uma página, abra com o Elementor, clique no ícone de pasta, aba
**Meus templates**, e insira o "Desafio 7 em 7 · Versão A". Nessa forma o Elementor busca as imagens na
prévia da Vercel e copia para a Multimídia.

## Regras
- Só rascunho. Publicar, trocar página inicial, mexer em menus, plugins, tema ou domínio: só com o OK do Patrik.
- Link de compra, preço e oferta: regra de pagamento do `CLAUDE.md` (mostrar antes/depois e esperar OK).
- Não apague nada que já existe no site dela.
- Não mostre nem copie a senha do `.env`.
