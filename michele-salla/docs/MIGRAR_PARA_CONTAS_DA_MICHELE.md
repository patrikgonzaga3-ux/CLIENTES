# Passar o painel e as páginas da Michele para a Vercel e o Supabase DELA (06/11/2026)

Pedido do Patrik: "passar toda base de dados da Michele pra Vercel dela e pro Supabase dela e depois pegar o acesso e
compartilhar com a nossa pra gente tomar conta, antes de publicar tudo". Quem executa: o Claude do PC do Patrik
(`C:\Users\Patri\CLIENTES`), com o Patrik logado nas contas da Michele no navegador.

## Prompt (copiar e colar no Claude do PC)

```
Responda sempre em português. Você vai passar o painel e as páginas da Michele Salla para a Vercel e o Supabase DA MICHELE,
sem perder nada e sem deixar nada fora do ar. Eu (Patrik) já estou logado nas contas dela no navegador.

ANTES DE TUDO
1. cd C:\Users\Patri\CLIENTES && git pull origin main
2. Leia: CLAUDE.md, michele-salla/PASSAGEM_BASTAO.md e michele-salla/docs/MIGRAR_PARA_CONTAS_DA_MICHELE.md (este arquivo).
3. Regras: nunca escreva senha, chave ou token no chat, em arquivo do repositório ou em commit (só no painel da Vercel,
   do Supabase ou em variável de ambiente local). Não apague nada do lado antigo (time "Ptk midias" na Vercel e projeto
   Supabase jratrlmlvguxtwevgzfc): o antigo fica de reserva até eu mandar desligar. Não mexa na Greenn nem na Hotmart
   (é comigo). Não publique página nem ligue anúncio. Se algo não estiver como este roteiro diz, pare e me pergunte.

PASSO 0 · CONFERIR AS CONTAS DELA (me mostre e espere o meu OK)
- Vercel da Michele: qual o plano. No Hobby (grátis) NÃO dá para convidar outra pessoa; para me dar acesso, a equipe
  dela precisa ser Pro (tem teste grátis de 14 dias). Me diga o que encontrou e espere eu decidir.
- Supabase da Michele: nome da organização e plano (o grátis aceita convidar membros). Região: São Paulo (sa-east-1).

PASSO 1 · SUPABASE NOVO (na conta dela)
1. Criar o projeto "painel-michele" na organização dela, região sa-east-1. Guardar a senha do banco só no gerenciador
   de senhas do Patrik (me avise para eu anotar; não escreva no chat).
2. Ligar as extensões: pg_cron, pg_net, pgcrypto, uuid-ossp e supabase_vault (Database > Extensions).
3. Copiar o banco do projeto antigo (jratrlmlvguxtwevgzfc) para o novo, estrutura e dados, só o schema public:
   - instale o cliente do PostgreSQL se não tiver (winget install PostgreSQL.PostgreSQL ou só o pg_dump);
   - pegue as duas URLs de conexão (Project Settings > Database > Connection string, modo "Session"), com as senhas
     digitadas por mim no terminal, nunca no chat;
   - pg_dump --schema=public --no-owner --no-privileges "URL_ANTIGA" > %TEMP%\michele.sql
   - psql "URL_NOVA" -f %TEMP%\michele.sql   (depois apague o %TEMP%\michele.sql: tem e-mail de cliente)
   - confira a contagem de linhas de cada tabela nos dois (hoje: pl_comportamento ~657, pl_meta_anuncios 22,
     pl_meta_conjuntos 22, pl_gastos_painel 10, pl_fontes 3, pl_emails_teste 3, pl_convites 2, pl_eventos 2,
     pl_usuarios 2, pl_segredos 1; view pl_compras).
4. Senha do robô de hora em hora: copiar o segredo "cron_secret" do Vault antigo para o Vault novo com o MESMO valor
   (leia com select decrypted_secret from vault.decrypted_secrets where name='cron_secret' e grave com
   vault.create_secret no novo, sem mostrar o valor). Assim o hash em pl_segredos (chave 'cron') continua valendo.
5. Recriar o robô no novo (o antigo chama /api/cron no minuto 7 de toda hora). Copie a definição exata do antigo:
   select jobname, schedule, command from cron.job; e crie igual no novo com cron.schedule. Só ligue depois do PASSO 3.
6. Convidar a conta do Patrik como membro (Owner ou Administrator) na organização dela: Organization > Team.

PASSO 2 · VERCEL (na conta dela)
Hoje são 2 projetos no time "Ptk midias", os dois ligados ao GitHub patrikgonzaga3-ux/CLIENTES (branch main):
- o PAINEL (Next.js, pasta michele-salla/painel, domínio painel.michelesalla.com.br);
- a PRÉVIA das páginas e quizzes (site estático na raiz do repositório, endereço clientes-phi-six.vercel.app, com o
  vercel.json da raiz; vai receber quiz.michelesalla.com.br).
1. Preferido: Transferir os 2 projetos do time "Ptk midias" para a equipe da Michele (Project > Settings > General >
   Transfer Project). Isso leva variáveis, domínios e histórico. Se a transferência não for possível, crie os 2 projetos
   de novo na conta dela importando o mesmo repositório e copie as variáveis (antes, rode `vercel env pull` no projeto
   antigo para ver os valores; variáveis marcadas como "Sensitive" não aparecem: me avise quais).
2. Variáveis do PAINEL (nomes; os valores ficam só na Vercel): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PAINEL_SENHA,
   ADMIN_EMAIL, CRON_SECRET, WEBHOOK_TOKEN, META_ACCESS_TOKEN, META_AD_ACCOUNT_ID, META_EVENTO_COMPRA,
   META_EVENTO_CHECKOUT, HOTMART_HOTTOK, KIWIFY_TOKEN, GOOGLE_SERVICE_ACCOUNT_JSON, PLANILHA_ID, PLANILHA_CSV_GASTOS,
   PLANILHA_CSV_CONFIG (algumas podem não existir; não crie as que não existem).
   - Troque só SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para o projeto NOVO (Project Settings > API).
   - WEBHOOK_TOKEN tem que continuar IGUAL (o aviso da Greenn usa esse token na URL).
3. Conferir que o deploy pelo GitHub funciona na conta dela: faça um commit pequeno (por exemplo a data no
   PASSAGEM_BASTAO) e veja os 2 projetos publicarem sozinhos. Se a Vercel bloquear o deploy (autor do commit, plano ou
   permissão do GitHub), pare e me diga a mensagem exata.
4. Domínios: painel.michelesalla.com.br no projeto do painel; quiz.michelesalla.com.br no projeto da prévia. A Vercel
   mostra o valor do CNAME de cada um: me passe os 2 valores para eu (Patrik) acertar no cPanel da TurboCloud
   (Zone Editor de michelesalla.com.br). Você não mexe no DNS.
5. Convidar a conta do Patrik (patrikgonzaga2@gmail.com, a que tem o conector da Vercel no Claude) como membro da
   equipe dela (só se o plano permitir; ver PASSO 0).

PASSO 3 · VIRADA E CONFERÊNCIA (o antigo continua de reserva)
1. Redeploy do painel com as variáveis novas. Abra painel.michelesalla.com.br/painel/fontes: Supabase "OK".
2. Ligue o robô no Supabase novo e rode uma vez na mão; confira pl_fontes atualizado e Meta "OK".
3. Desligue SÓ o robô do Supabase antigo (cron.unschedule('painel-robos-hora')), para não gravar em dois lugares.
4. Teste o rastreio: abra https://clientes-phi-six.vercel.app/michele-salla/quiz-pilates/?p=1&utm_source=teste-claude,
   responda 3 telas e confira a linha nova em pl_comportamento do Supabase NOVO; depois apague essa linha de teste.
5. Teste o aviso da Greenn (eu disparo um teste pelo painel da Greenn) e veja chegar em pl_eventos do novo.
6. Atualize michele-salla/PASSAGEM_BASTAO.md (seção 2, contas e IDs: novo projeto Supabase, equipe Vercel dela,
   onde está cada domínio) e a seção 8 (diário), sem nenhuma senha ou chave. Commit e push.
7. Me entregue: o que foi feito, o que conferiu OK, o que ficou pendente (DNS, plano, convites) e os 2 valores de CNAME.
```

## O que existe hoje (conferido em 06/11/2026)

- **Supabase** `jratrlmlvguxtwevgzfc` ("patrikgonzaga3-ux's Project"): schema public com pl_abandonos, pl_ajustes,
  pl_comportamento, pl_config, pl_convites, pl_emails_teste, pl_eventos, pl_fontes, pl_gastos, pl_gastos_painel,
  pl_meta_anuncios, pl_meta_conjuntos, pl_segredos, pl_usuarios e a view pl_compras. Extensões pg_cron, pg_net,
  pgcrypto, uuid-ossp, supabase_vault. Robô `painel-robos-hora` (`7 * * * *`) chama `/api/cron` com o segredo
  `cron_secret` do Vault; o sha256 dele está em `pl_segredos` (chave 'cron'). Estrutura de referência:
  `michele-salla/painel/supabase/schema.sql` (pode estar atrás do banco: copiar do banco, não do arquivo).
- **Vercel** time "Ptk midias" (o conector da Vercel desta sessão de nuvem não vê esse time): projeto do painel
  (`painel.michelesalla.com.br`, CNAME hoje para `a5f61be1c2b5d62a.vercel-dns-017.com`) e projeto da prévia
  (`clientes-phi-six.vercel.app`, `vercel.json` da raiz já reescreve `quiz.michelesalla.com.br`: raiz = quiz do
  pilates, `/desafio/` = quiz do Desafio).
- **DNS** de michelesalla.com.br: TurboCloud (ns1/ns2.luke9050.com.br), cPanel. Só o Patrik mexe.
- **Greenn**: webhook `https://painel.michelesalla.com.br/api/webhook/greenn?token=<WEBHOOK_TOKEN>`. Não muda se o
  domínio e o token forem os mesmos.
