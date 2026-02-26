create table if not exists public.clientes (
  id bigint generated always as identity primary key,
  nome text not null,
  email text not null,
  telefone text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ordens_servico (
  id bigint generated always as identity primary key,
  titulo text not null,
  status text not null check (status in ('Em andamento', 'Aguardando material', 'Finalizada')),
  valor numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.clientes enable row level security;
alter table public.ordens_servico enable row level security;

drop policy if exists "allow read/write clientes" on public.clientes;
create policy "allow read/write clientes"
  on public.clientes
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "allow read/write ordens" on public.ordens_servico;
create policy "allow read/write ordens"
  on public.ordens_servico
  for all
  to anon, authenticated
  using (true)
  with check (true);

alter publication supabase_realtime add table public.clientes;
alter publication supabase_realtime add table public.ordens_servico;
