create table if not exists public.users (
  id bigint generated always as identity primary key,
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id bigint generated always as identity primary key,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.products_services (
  id bigint generated always as identity primary key,
  name text not null,
  type text not null check (type in ('PRODUTO', 'SERVICO')),
  price numeric(12,2) not null default 0,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id bigint generated always as identity primary key,
  client_id bigint not null references public.clients(id) on delete cascade,
  description text not null,
  start_date date not null,
  end_date date,
  status text not null check (status in ('ATIVO', 'INATIVO')),
  monthly_value numeric(12,2),
  referred_by_client_id bigint references public.clients(id) on delete set null,
  created_at timestamptz not null default now()
);



create table if not exists public.financial_entries (
  id bigint generated always as identity primary key,
  title text not null,
  type text not null check (type in ('PAGAR', 'RECEBER')),
  amount numeric(12,2) not null,
  due_date date not null,
  status text not null check (status in ('PENDENTE', 'PAGO', 'RECEBIDO')) default 'PENDENTE',
  client_id bigint references public.clients(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.kanban_columns (
  id bigint generated always as identity primary key,
  name text not null,
  position int not null
);

create table if not exists public.kanban_cards (
  id bigint generated always as identity primary key,
  title text not null,
  client_id bigint references public.clients(id) on delete set null,
  column_id bigint not null references public.kanban_columns(id) on delete cascade,
  value_estimated numeric(12,2),
  owner_user_id bigint references public.users(id) on delete set null,
  due_date date,
  position int not null default 1,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.products_services enable row level security;
alter table public.contracts enable row level security;
alter table public.kanban_columns enable row level security;
alter table public.kanban_cards enable row level security;
alter table public.financial_entries enable row level security;

create policy if not exists "mvp all users" on public.users for all to anon, authenticated using (true) with check (true);
create policy if not exists "mvp all clients" on public.clients for all to anon, authenticated using (true) with check (true);
create policy if not exists "mvp all products_services" on public.products_services for all to anon, authenticated using (true) with check (true);
create policy if not exists "mvp all contracts" on public.contracts for all to anon, authenticated using (true) with check (true);
create policy if not exists "mvp all kanban_columns" on public.kanban_columns for all to anon, authenticated using (true) with check (true);
create policy if not exists "mvp all kanban_cards" on public.kanban_cards for all to anon, authenticated using (true) with check (true);
create policy if not exists "mvp all financial_entries" on public.financial_entries for all to anon, authenticated using (true) with check (true);

insert into public.kanban_columns (name, position)
select * from (values
  ('Novo', 1),
  ('Em contato', 2),
  ('Proposta', 3),
  ('Fechado', 4),
  ('Perdido', 5)
) as seed(name, position)
where not exists (select 1 from public.kanban_columns);

insert into public.users (username, password_hash)
select 'nexuscore', 'Nc@911500'
where not exists (select 1 from public.users where username = 'nexuscore');
