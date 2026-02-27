insert into public.clients (name, phone, email, address, notes) values
('Empresa Alpha', '(11) 99999-0001', 'contato@alpha.com', 'Rua A, 123', 'Cliente premium'),
('Empresa Beta', '(11) 99999-0002', 'contato@beta.com', 'Rua B, 456', 'Indica novos clientes')
on conflict do nothing;

insert into public.contracts (client_id, description, start_date, status, monthly_value, referred_by_client_id)
select c1.id, 'Comodato Máquina X', current_date, 'ATIVO', 1299.90, c2.id
from public.clients c1
join public.clients c2 on c2.name = 'Empresa Beta'
where c1.name = 'Empresa Alpha';


insert into public.financial_entries (title, type, amount, due_date, status, notes) values
('Aluguel escritório', 'PAGAR', 2500.00, current_date + interval '5 day', 'PENDENTE', 'Pagamento mensal'),
('Fatura cliente Alpha', 'RECEBER', 4200.00, current_date + interval '7 day', 'PENDENTE', 'Contrato ativo');
