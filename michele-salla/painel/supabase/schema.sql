-- ════════════════════════════════════════════════════════════════════
-- Painel de Lucro · banco do cliente (Supabase / Postgres)
-- Rodar UMA vez no projeto Supabase do cliente (SQL Editor ou migração). Pode rodar de novo: não apaga nada.
-- Tudo com prefixo pl_ para não misturar com tabelas que o cliente já tenha. Só o servidor do painel
-- (chave service_role) lê e escreve: anon e authenticated ficam sem acesso.
-- ════════════════════════════════════════════════════════════════════

-- 1) Avisos do gateway: 1 linha por mudança de status de cada venda (aprovada, reembolsada…).
create table if not exists public.pl_eventos (
  id              bigserial primary key,
  event_key       text unique not null,      -- gateway + venda + status (reenvio do mesmo aviso não duplica)
  gateway         text not null,
  status          text not null,             -- aprovada | reembolsada | chargeback | aguardando | recusada | criada | cancelada | outro
  status_original text,
  transacao       text not null,
  produto_id      text,
  produto_nome    text,
  oferta          text,
  valor           numeric,                   -- o que o cliente pagou
  liquido         numeric,                   -- o que sobra depois da taxa do gateway (quando o gateway manda)
  metodo          text,
  parcelas        int,
  nome            text,
  email           text,
  telefone        text,
  src             text,                      -- utm_term = id do conjunto de anúncios
  sck             text,                      -- utm_source = página / origem
  xcod            text,
  utm_campaign    text,
  utm_content     text,                      -- nome do anúncio
  renovacao       boolean not null default false,
  data_pedido     timestamptz,
  data_aprovacao  timestamptz,
  recebido_em     timestamptz not null default now(),
  raw             jsonb
);
create index if not exists pl_eventos_transacao on public.pl_eventos (transacao);
create index if not exists pl_eventos_recebido on public.pl_eventos (recebido_em desc);

-- E-mails de compra de teste (nunca contam como venda).
create table if not exists public.pl_emails_teste (email text primary key, nota text);

-- 2) Uma linha por VENDA (transação), com o estado atual. viva = aprovada e não devolvida.
create or replace view public.pl_compras as
  with g as (
    select
      e.transacao,
      (array_agg(e.gateway      order by e.recebido_em desc))[1] as gateway,
      (array_agg(e.produto_id   order by e.recebido_em desc))[1] as produto_id,
      (array_agg(e.produto_nome order by e.recebido_em desc))[1] as produto_nome,
      (array_agg(e.status       order by e.recebido_em desc))[1] as ultimo_status,
      max(e.valor)                                                 as valor,
      max(e.liquido)                                               as liquido,
      min(coalesce(e.data_aprovacao, e.recebido_em)) filter (where e.status = 'aprovada') as aprovada_em,
      max(e.recebido_em) filter (where e.status in ('reembolsada', 'chargeback'))         as reembolsada_em,
      min(coalesce(e.data_pedido, e.recebido_em))                  as pedido_em,
      max(lower(trim(e.email)))                                    as email,
      max(e.nome)                                                  as nome,
      max(e.telefone)                                              as telefone,
      max(e.metodo)                                                as metodo,
      max(e.src)  filter (where coalesce(e.src, '') <> '')         as src,
      max(e.sck)  filter (where coalesce(e.sck, '') <> '')         as sck,
      max(e.xcod) filter (where coalesce(e.xcod, '') <> '')        as xcod,
      max(e.utm_content) filter (where coalesce(e.utm_content, '') <> '') as utm_content,
      bool_or(e.renovacao)                                         as renovacao
    from public.pl_eventos e
    group by e.transacao
  )
  select g.*,
         g.aprovada_em is not null and g.ultimo_status not in ('reembolsada', 'chargeback') as viva,
         exists (select 1 from public.pl_emails_teste t where t.email = g.email)            as teste
  from g;

-- 3) Checkout abandonado (preencheu os dados e saiu sem pagar).
create table if not exists public.pl_abandonos (
  id          bigserial primary key,
  event_key   text unique not null,
  gateway     text not null,
  produto_id  text,
  produto_nome text,
  valor       numeric,
  nome        text,
  email       text,
  telefone    text,
  sck         text,
  src         text,
  quando      timestamptz,
  recebido_em timestamptz not null default now(),
  raw         jsonb
);

-- 4) Gasto do Meta por conjunto e dia, e por anúncio e dia (robô de hora em hora).
create table if not exists public.pl_meta_conjuntos (
  adset_id text not null, date date not null,
  adset_name text, campaign_id text, campaign_name text,
  spend numeric, impressions int, clicks int, link_clicks int, lp_views int, ic int, purchases int, purchase_value numeric,
  updated_at timestamptz not null default now(),
  primary key (adset_id, date)
);
create table if not exists public.pl_meta_anuncios (
  ad_id text not null, date date not null,
  ad_name text, adset_id text, adset_name text, campaign_id text, campaign_name text,
  spend numeric, impressions int, link_clicks int, lp_views int, ic int, purchases int, purchase_value numeric,
  updated_at timestamptz not null default now(),
  primary key (ad_id, date)
);

-- 5) Planilha de gastos (robô de hora em hora: a planilha é a fonte; estas tabelas são a cópia).
create table if not exists public.pl_gastos (
  id text primary key,                     -- linha da planilha (aba + nº da linha)
  mes text not null,                       -- AAAA-MM
  grupo text not null,
  descricao text not null,
  tipo text not null check (tipo in ('fixo', '%')),
  valor numeric not null,
  recorrente boolean not null default false,
  lido_em timestamptz not null default now()
);
create table if not exists public.pl_config (
  chave text primary key,
  valor text,
  lido_em timestamptz not null default now()
);

-- 6) Comportamento na página de vendas (1 linha por visita; script /rastreio.js).
create table if not exists public.pl_comportamento (
  id text primary key, vid text, slug text not null,
  inicio timestamptz not null default now(), atualizado timestamptz not null default now(),
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  fbclid boolean not null default false, aparelho text, largura int, altura int, ref text,
  carregou_ms int, total_ms int not null default 0, ativo_ms int not null default 0,
  rolagem_max int not null default 0, bloco_max int not null default 0, ultimo_bloco int not null default 0,
  blocos jsonb not null default '{}'::jsonb, cliques jsonb not null default '[]'::jsonb,
  comprar_ms int, comprar_local text, saiu boolean not null default false
);
create index if not exists pl_comportamento_inicio on public.pl_comportamento (inicio desc);

-- 7) Saúde de cada fonte (última leitura, se deu certo, quantas linhas).
create table if not exists public.pl_fontes (
  nome text primary key, ultima_leitura timestamptz, ok boolean, detalhe text, linhas int
);

-- 8) Ajustes feitos no próprio painel (aba Ajustes). Valem mais que a planilha e que o cliente.config.ts.
--    pl_ajustes: meta de lucro, ticket, impostos, funil 3x… (chave → valor).
--    pl_gastos_painel: lista de gastos editável. Quando tem linhas, o lucro usa ela no lugar da cópia da planilha;
--    a planilha serve para puxar os dados iniciais (botão "Puxar da planilha").
create table if not exists public.pl_ajustes (
  chave text primary key,
  valor text,
  editado_em timestamptz not null default now()
);
create table if not exists public.pl_gastos_painel (
  id text primary key,
  mes text not null,                       -- AAAA-MM
  grupo text not null,
  descricao text not null,
  tipo text not null check (tipo in ('fixo', '%')),
  valor numeric not null,
  recorrente boolean not null default false,
  origem text not null default 'painel',   -- painel | planilha
  editado_em timestamptz not null default now()
);

-- Segurança: só o servidor (service_role) acessa.
do $$ declare t text; begin
  foreach t in array array['pl_eventos','pl_emails_teste','pl_abandonos','pl_meta_conjuntos','pl_meta_anuncios','pl_gastos','pl_config','pl_comportamento','pl_fontes','pl_ajustes','pl_gastos_painel'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;
revoke all on public.pl_compras from anon, authenticated;

-- 9) Robô de hora em hora (Meta + planilha). Precisa das extensões pg_cron e pg_net (Supabase → Database →
--    Extensions). Trocar <ENDERECO_DO_PAINEL> e <CRON_SECRET> e rodar à parte:
-- select cron.schedule('painel-lucro-hora', '17 * * * *',
--   $$ select net.http_get(url := 'https://<ENDERECO_DO_PAINEL>/api/cron?key=<CRON_SECRET>', timeout_milliseconds := 120000) $$);
