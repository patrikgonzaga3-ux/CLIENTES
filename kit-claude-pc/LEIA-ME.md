# Kit do Claude no PC · WordPress da Michele Salla

Com este kit, o Claude do seu PC abre já sabendo tudo do projeto do Desafio 7 em 7 e consegue
criar e atualizar a página no WordPress/Elementor da Michele, sempre como **rascunho**.

## 1. Senha de aplicação (você já tem)
Se um dia precisar de outra: entre no painel da Michele e abra
`https://michelesalla.com.br/wp-admin/authorize-application.php?app_name=Claude-PC`
→ clique em **Sim, aprovo esta ligação** → copie a senha que aparece (só aparece uma vez).
Para cortar o acesso: **Utilizadores → Perfil → Palavras-passe de aplicação → Revogar**.

## 2. Abrir o Claude com tudo pronto
1. Salve o arquivo **`ABRIR-CLAUDE.bat`** na sua Área de Trabalho.
2. Clique duas vezes nele.
3. Na primeira vez:
   - Se faltar o **Git** ou o **Claude Code**, ele avisa e abre a instalação. Instale e clique de novo no arquivo.
   - O GitHub pode pedir login no navegador: entre com a conta **patrikgonzaga3-ux** (ou a antiga, que é colaboradora).
   - Vai abrir o **Bloco de Notas** com o arquivo `.env`. Troque `cole-aqui-a-senha-de-aplicacao`
     pela senha de aplicação, salve (**Ctrl+S**) e feche o Bloco de Notas.
4. O Claude abre na pasta `CLIENTES`, confere o acesso e diz o próximo passo.

A senha fica só no arquivo `C:\Users\<você>\CLIENTES\.env`. Ela nunca vai para o GitHub.

## 3. Snippet do Elementor (uma vez só)
Para o Claude gravar o layout do Elementor direto, o site precisa de um snippet pequeno:
1. No painel da Michele: **Code Snippets → Adicionar novo** (ou "Add New").
2. Título: `Claude · gravar Elementor por API`. Tipo: **PHP**.
3. Cole o conteúdo de `michele-salla/desafio-7em7/elementor/snippet-claude-elementor.php`
   (sem a primeira linha `<?php`, se o Code Snippets reclamar).
4. Onde executar: **Executar em todo lugar** (Run everywhere) → **Salvar e ativar**.

Ele só cria uma rota que grava o Elementor numa página, e só para quem tem a senha.
Para desligar, é só desativar o snippet.

## 4. O que pedir para o Claude
- "Crie a página do Desafio 7 em 7 versão A como rascunho."
- "Atualize a página 123 com a versão C."
- "Liste as páginas do site."

Nada vai ao ar sem o seu OK.
