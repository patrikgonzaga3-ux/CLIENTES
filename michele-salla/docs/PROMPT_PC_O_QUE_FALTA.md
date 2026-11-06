# O que falta para o quiz do pilates ir ao ar (06/11/2026) · prompt para o Claude do PC

Decisão do Patrik (06/11): nada migra para as contas da Michele; fica tudo nas nossas (Supabase jratrlmlvguxtwevgzfc,
Vercel time "Ptk midias", repositório CLIENTES). O Claude da nuvem já deixou pronto: quiz do pilates com o link da Hotmart
(R$ 37, oferta 6lnthlfw), pixel, rastreio do painel e a configuração do endereço quiz.michelesalla.com.br no vercel.json.
Falta o que só dá para fazer logado: domínio, aviso de venda da Hotmart e (opcional) a página do Desafio no WordPress.

## Prompt (copiar e colar no Claude do PC)

```
Responda sempre em português. Vamos terminar o que falta para o quiz do pilates da Michele Salla ir ao ar.
Eu (Patrik) estou logado na Vercel (time "Ptk midias"), no cPanel da TurboCloud e na Hotmart da Michele.

ANTES
1. cd %USERPROFILE%\CLIENTES && git pull origin main   (neste PC: C:\Users\PATRICK\CLIENTES)
2. Leia CLAUDE.md, michele-salla/PASSAGEM_BASTAO.md e michele-salla/docs/PROMPT_PC_O_QUE_FALTA.md.
3. Regras: nunca escreva senha, chave, token ou hottok no chat nem no repositório (só no painel da Vercel).
   Não mexa na Greenn, não crie nem ligue anúncio, não apague nada. No DNS, só o registro "quiz" deste roteiro.
   Se algo não estiver como aqui, pare e me pergunte.

PASSO 1 · ENDEREÇO quiz.michelesalla.com.br
0. Confira que a Vercel aberta é a do time "Ptk midias" (a conta patrikgonzaga2 NÃO tem esse time: é outro login,
   provavelmente o ligado ao GitHub patrikgonzaga3-ux, dono do repositório CLIENTES). Se não for, pare e me peça para trocar.
1. Vercel, time "Ptk midias": abra o projeto que serve clientes-phi-six.vercel.app (a prévia estática do repositório
   CLIENTES; NÃO é o projeto do painel). Settings > Domains > Add: quiz.michelesalla.com.br (produção, sem redirecionar).
2. Anote o valor de CNAME que a Vercel mostra para esse domínio.
3. cPanel da TurboCloud > Zone Editor > michelesalla.com.br > Add Record: tipo CNAME, nome "quiz", valor = o da Vercel.
   Não mexa em nenhum outro registro.
4. Espere a Vercel marcar "Valid Configuration" e o cadeado (HTTPS). Pode levar alguns minutos.
5. Confira no navegador (aba anônima):
   - https://quiz.michelesalla.com.br/?p=1  → quiz do PILATES, capa "Depois dos 40…", foto da Michele no estúdio;
   - responda até o fim: a página final mostra R$ 37 e o botão abre a Hotmart "PILATES EM CASA - COM MICHELE SALLA";
   - https://quiz.michelesalla.com.br/desafio/?p=1 → quiz do DESAFIO 7 em 7 (R$ 47);
   - https://quiz.michelesalla.com.br/revisao/ → relatório do pilates para a Michele;
   - fotos e fontes carregam (nada quebrado); no Meta Pixel Helper (ou DevTools > Rede, "fbevents"), aparece o
     pixel 991344998762063 com PageView no endereço novo.

PASSO 2 · AVISO DE VENDA DA HOTMART → PAINEL (para as vendas do pilates aparecerem no painel)
1. Hotmart da Michele > Ferramentas > Webhook (API e notificações) > Cadastrar:
   - Nome: Painel Michele
   - URL: https://painel.michelesalla.com.br/api/webhook/hotmart
   - Versão: 2.0.0
   - Produto: PILATES EM CASA - COM MICHELE SALLA (ou todos os produtos dela)
   - Eventos: compra aprovada, compra completa, cancelada, reembolsada, chargeback, atrasada, aguardando pagamento /
     boleto impresso e abandono de carrinho (o que existir na tela).
2. Na mesma área da Hotmart, copie o "Hottok" (token de verificação). Cole SÓ na Vercel: time "Ptk midias" > projeto do
   PAINEL (painel.michelesalla.com.br) > Settings > Environment Variables > HOTMART_HOTTOK (Production). Depois:
   Deployments > Redeploy do último deploy de produção.
3. Na Hotmart, use "Enviar teste" do webhook. Confira em https://painel.michelesalla.com.br/painel/fontes que chegou um
   aviso da Hotmart. Me diga a hora do teste: o Claude da nuvem marca esse teste para não contar como venda.

PASSO 3 · PÁGINA DO DESAFIO NO WORDPRESS (só se eu disser "pode atualizar a página")
O Patrik decidiu tirar "exercícios funcionais" do Desafio (fica hipopressivo + áudio). O gerador já está atualizado.
1. Pergunte antes: "Posso regravar a página 10264 (desafio7em7-a) com a versão F atualizada?"
2. Com o meu OK: python tools/wp_michele.py atualizar-pagina --id 10264 --versao F
3. Depois: python tools/wp_michele.py conferir   (tem que dar 9 OK). Me mostre a saída.

NO FIM
- Atualize michele-salla/PASSAGEM_BASTAO.md (seção 8, diário): domínio no ar (com o valor do CNAME), webhook da Hotmart
  ligado (sem o hottok), página do Desafio (se regravada). Commit e push.
- Me entregue: o que funcionou, o que falhou (com a mensagem exata) e o que ficou para mim.
```

## Rodada 2 (06/11, fim da tarde): tudo o que falta para o quiz do pilates rodar anúncio

O domínio já está no ar (quiz.michelesalla.com.br, /desafio/, /revisao/) e o webhook da Hotmart foi cadastrado.

```
Responda sempre em português. Vamos deixar o quiz do pilates da Michele 100% pronto para anúncio, agora.
Eu (Patrik) estou aqui para digitar o que for segredo. Regras de sempre: nunca escreva senha, chave, token ou hottok no
chat nem no repositório (eu colo os segredos; você abre a tela certa e me diz onde colar); não mexa na Greenn; não crie
nem ligue anúncio; se algo fugir do roteiro, pare e me pergunte.

0. cd %USERPROFILE%\CLIENTES && git pull origin main

1. HOTTOK DA HOTMART → PAINEL
   a) Abra a Hotmart da Michele > Ferramentas > Webhook > aba Autenticação, na tela do Hottok. Me avise para eu copiar.
   b) Abra a Vercel, time ptk-midias > projeto painel-michele-salla > Settings > Environment Variables > Add, nome
      HOTMART_HOTTOK, ambiente Production. Me avise para eu colar o valor e salvar.
   c) Faça o Redeploy do último deploy de produção do painel-michele-salla e espere ficar "Ready".
   d) Me peça para clicar em "Enviar teste" no webhook "Painel Michele" da Hotmart. Confira em
      https://painel.michelesalla.com.br/painel/fontes que chegou um aviso da Hotmart e me diga a hora exata.

2. CLARITY (gravações e mapas do quiz)
   a) Em https://clarity.microsoft.com (se pedir login, eu entro): Novo projeto, nome "Michele Salla - Quiz",
      site https://quiz.michelesalla.com.br, categoria Saúde e bem-estar (ou a mais próxima).
   b) Em Configurações > Configuração, copie o CÓDIGO DO PROJETO (10 letras e números, ex.: z7uwmaj6sh). Não é segredo.
   c) Abra https://agenciaptk.com.br/ptk/michele-salla (se pedir senha do painel, eu digito) > editar a ficha > campo
      Clarity: cole o código e salve. Se não achar o campo, só me passe o código no chat.
   d) Em 5 a 10 minutos, abra https://quiz.michelesalla.com.br/?p=1&utm_source=teste-claude numa aba anônima e responda
      até a oferta. No Clarity, confira em "Gravações" (pode levar ~30 min para aparecer) que a visita entrou.

3. PIXEL DO META NO PRODUTO DA HOTMART (para a campanha otimizar por Compra)
   a) Hotmart > Produtos > PILATES EM CASA - COM MICHELE SALLA > Configurações (ou Ferramentas > Pixel de rastreamento) >
      Facebook/Meta: pixel 991344998762063.
   b) Marque os eventos que a Hotmart oferecer: visualização/início do checkout (InitiateCheckout) e compra aprovada
      (Purchase). Se pedir token da API de conversões, pule e me avise (é outro passo).
   c) Salve e me mostre a tela final (print), sem nenhum token.

4. TESTE DE PONTA A PONTA (sem comprar)
   a) Aba anônima, celular no DevTools (iPhone): https://quiz.michelesalla.com.br/?p=2&utm_source=teste-claude&utm_content=teste
   b) Responda o quiz até o fim. Confira: análise segue sozinha, perfil aparece, oferta mostra R$ 37, 24 aulas, módulos 0 a 4,
      4 bônus, garantia de 7 dias e 365 dias de acesso.
   c) Clique em "Quero começar o meu pilates em casa": abre a Hotmart "PILATES EM CASA - COM MICHELE SALLA" com R$ 37 e o
      link com sck=pilates-p2. Feche sem pagar.
   d) No Meta Pixel Helper (ou Gerenciador de Eventos do pixel 991344998762063 > Testar eventos), veja PageView no quiz,
      CliqueComprar no botão e InitiateCheckout na Hotmart.
   e) Em https://painel.michelesalla.com.br/painel/pilates (aba Quiz Pilates, filtro "Todas as visitas"), veja a sua visita
      de teste com as telas e as respostas. Me diga a hora: o Claude da nuvem apaga essa visita de teste.

5. NO FIM
   Atualize michele-salla/PASSAGEM_BASTAO.md (seção 8): hottok ligado, Clarity (com o código, que não é segredo), pixel na
   Hotmart e o resultado do teste. Commit e push. Me entregue uma lista curta: OK / falhou (com a mensagem exata) / ficou para mim.
```

## Se a Vercel aberta não for a do time "Ptk midias" (prompt de investigação)

```
O Patrik não sabe qual login da Vercel tem o time "Ptk midias". Descubra e entre nele, sem criar conta nem time novo.
1. Na Vercel aberta no Chrome: abra o seletor de time (canto superior esquerdo) e veja vercel.com/account; anote
   qual e-mail/conta está logada e quais times aparecem.
2. Descubra qual time publica o repositório: abra https://github.com/patrikgonzaga3-ux/CLIENTES/deployments
   (ou o último commit da main > o check/status "Vercel") e clique no link do deploy. O endereço mostra
   vercel.com/<time>/<projeto>: esse <time> é o "Ptk midias". Anote o projeto do painel e o da prévia (clientes-phi-six).
3. Veja se o Chrome tem outro perfil (ícone do perfil no canto superior direito) já logado na Vercel com esse time.
4. Se não tiver: em vercel.com, saia (Log Out) e entre com "Continue with GitHub" usando a conta do GitHub
   patrikgonzaga3-ux (a dona do repositório CLIENTES; o Chrome deste PC provavelmente já está logado nela no GitHub).
   Se pedir senha, código ou 2FA, pare e peça para o Patrik digitar.
5. Se ainda não aparecer o "Ptk midias", teste "Continue with Google" e "Continue with Email" com os e-mails que o
   Patrik indicar. Não crie conta nova.
6. Me diga: qual login tem o time "Ptk midias", e os nomes dos 2 projetos. Depois siga o PASSO 1.
```

## Referência

- Quiz do pilates: `michele-salla/quiz-pilates/` (textos em `pilates.js`; motor `michele-salla/quiz/motor.js`).
- Rotas do endereço novo: `vercel.json` da raiz (raiz = pilates, `/desafio/` = Desafio, `/quiz/` e `/desafio-7em7/` =
  arquivos compartilhados). A prévia continua em clientes-phi-six.vercel.app.
- Painel: aba Quiz Pilates (`/painel/pilates`), slugs `pilates-p1` … `pilates-p5`; o botão de compra leva `sck=pilates-pN`,
  que a Hotmart devolve no aviso de venda.
