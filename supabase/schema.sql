-- =========================================================
-- Barbearia do Pedro - Schema do Banco de Dados (Supabase)
-- Rode este SQL inteiro no SQL Editor do seu projeto Supabase
-- =========================================================

-- Tabela de serviços (corte, barba, etc.)
create table if not exists servicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  preco numeric(10,2) not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Tabela de clientes (preenchida automaticamente ao agendar)
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  criado_em timestamptz not null default now()
);

-- Tabela de agendamentos
create table if not exists agendamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  servico_id uuid not null references servicos(id) on delete restrict,
  data_hora timestamptz not null,
  status text not null default 'agendado' check (status in ('agendado', 'concluido', 'cancelado')),
  criado_em timestamptz not null default now()
);

-- Evita dois agendamentos ativos no mesmo horário exato
create unique index if not exists agendamentos_horario_unico
  on agendamentos (data_hora)
  where status = 'agendado';

-- =========================================================
-- Row Level Security (RLS)
-- =========================================================
alter table servicos enable row level security;
alter table clientes enable row level security;
alter table agendamentos enable row level security;

-- SERVIÇOS: qualquer pessoa pode ver os ativos; só admin logado pode alterar
create policy "servicos_select_publico" on servicos
  for select using (ativo = true);

create policy "servicos_admin_tudo" on servicos
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- CLIENTES: qualquer um pode se cadastrar (inserir), só admin pode ler/editar
create policy "clientes_insert_publico" on clientes
  for insert with check (true);

create policy "clientes_admin_leitura" on clientes
  for select using (auth.role() = 'authenticated');

create policy "clientes_admin_update_delete" on clientes
  for update using (auth.role() = 'authenticated');

-- AGENDAMENTOS: qualquer um pode criar (agendar), só admin pode ler/editar/cancelar
create policy "agendamentos_insert_publico" on agendamentos
  for insert with check (true);

create policy "agendamentos_admin_leitura" on agendamentos
  for select using (auth.role() = 'authenticated');

create policy "agendamentos_admin_update" on agendamentos
  for update using (auth.role() = 'authenticated');

-- =========================================================
-- Dados de exemplo (serviços iniciais da barbearia)
-- =========================================================
insert into servicos (nome, preco) values
  ('Corte de Cabelo', 50.00),
  ('Barba Completa', 35.00),
  ('Corte + Barba', 75.00),
  ('Sobrancelha', 15.00)
on conflict do nothing;
