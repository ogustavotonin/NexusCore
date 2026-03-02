alter table if exists public.kanban_columns
  add column if not exists funnel text;

update public.kanban_columns
set funnel = coalesce(funnel, 'PROSPECCAO_QUALIFICACAO');

alter table if exists public.kanban_columns
  alter column funnel set not null;

alter table if exists public.kanban_columns
  add constraint kanban_columns_funnel_check
  check (funnel in ('PROSPECCAO_QUALIFICACAO', 'VENDAS_PONTUAIS', 'COMODATO'));

alter table if exists public.kanban_cards
  add column if not exists agendor_deal_id bigint;

alter table if exists public.contracts
  add column if not exists agendor_deal_id bigint,
  add column if not exists asaas_subscription_id text,
  add column if not exists asaas_customer_id text,
  add column if not exists contract_duration_months integer;

insert into public.kanban_columns (name, position, funnel)
select * from (values
  ('Novo lead', 1, 'PROSPECCAO_QUALIFICACAO'),
  ('Em contato', 2, 'PROSPECCAO_QUALIFICACAO'),
  ('Qualificação', 3, 'PROSPECCAO_QUALIFICACAO'),
  ('Proposta', 4, 'PROSPECCAO_QUALIFICACAO'),
  ('Fechado', 5, 'PROSPECCAO_QUALIFICACAO'),
  ('Entrada', 1, 'VENDAS_PONTUAIS'),
  ('Negociação', 2, 'VENDAS_PONTUAIS'),
  ('Pagamento', 3, 'VENDAS_PONTUAIS'),
  ('Entregue', 4, 'VENDAS_PONTUAIS'),
  ('Finalizado', 5, 'VENDAS_PONTUAIS'),
  ('Implantação', 1, 'COMODATO'),
  ('Contrato enviado', 2, 'COMODATO'),
  ('Assinatura pendente', 3, 'COMODATO'),
  ('Assinado', 4, 'COMODATO'),
  ('Ativo', 5, 'COMODATO')
) as seed(name, position, funnel)
where not exists (
  select 1
  from public.kanban_columns c
  where c.name = seed.name and c.position = seed.position and c.funnel = seed.funnel
);
