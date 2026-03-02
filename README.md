# NexusCore MVP - CRM + Kanban + Indicações

MVP web responsivo para uso interno com **Next.js + TypeScript + Tailwind** no frontend e **Supabase (Postgres)** no backend.

## Funcionalidades implementadas

- Login simples por `username + password` usando tabela `users` no Supabase (sem segurança avançada, focado no MVP).
- Rotas internas protegidas por sessão simples via cookie.
- Menu hambúrguer em todas as telas internas:
  - Dashboard
  - Kanban
  - Clientes
  - CRM (Contratos)
  - Indicações
  - Financeiro
  - Produtos & Serviços
  - Sair
- CRM:
  - CRUD de clientes
  - CRUD básico de contratos de comodato
- Kanban:
  - Colunas configuráveis no banco
  - Cards com drag-and-drop (dnd-kit)
  - Persistência de coluna/posição no Supabase
- Produtos & Serviços:
  - CRUD básico
- Financeiro (Contas a pagar e receber):
  - Lançamentos com tipo PAGAR/RECEBER
  - Status (PENDENTE/PAGO/RECEBIDO)
  - Totais pendentes e baixa rápida
- Indicações:
  - Contrato pode ser indicado por um cliente (`referred_by_client_id`)
  - Resumo por cliente indicador com:
    - quantidade de contratos indicados ATIVOS
    - percentual de desconto (`qtd * 10%`)
    - lista de contratos válidos para desconto

---

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- dnd-kit
- Supabase JS

---

## Estrutura de pastas

```bash
.
├── app/
│   ├── dashboard/page.tsx
│   ├── kanban/page.tsx
│   ├── clientes/page.tsx
│   ├── crm/contratos/page.tsx
│   ├── indicacoes/page.tsx
│   ├── login/page.tsx
│   ├── financeiro/page.tsx
│   ├── produtos-servicos/page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── FormCliente.tsx
│   ├── IndicationsSummary.tsx
│   ├── InternalShell.tsx
│   ├── KanbanBoard.tsx
│   ├── MenuHamburguer.tsx
│   └── TabelaClientes.tsx
├── lib/
│   ├── auth.ts
│   ├── supabase.ts
│   └── types.ts
├── supabase/
│   ├── migrations/001_mvp_crm_kanban_indicacoes.sql
│   └── seed.sql

Inclui também a tabela `financial_entries` para contas a pagar e receber.
├── middleware.ts
└── README.md
```

---

## Configuração do Supabase

1. Crie um projeto no Supabase.
2. Abra **SQL Editor** e execute:
   - `supabase/migrations/001_mvp_crm_kanban_indicacoes.sql`
3. (Opcional) execute `supabase/seed.sql` para dados iniciais.
4. Pegue suas credenciais em **Project Settings > API**.

Crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

---

## Rodar localmente

```bash
npm install
npm run dev
```

Abra: `http://localhost:3000`

Usuário inicial (seed da migration):

- usuário: `nexuscore`
- senha: `Nc@911500`
- usuário: `admin`
- senha: `admin123`

---

## Observações de MVP

- A autenticação foi feita pela tabela `users` para simplicidade.
- `password_hash` está em formato simples (sem hash forte) por requisito de MVP interno.
- Em produção, recomenda-se migrar para Supabase Auth + hash seguro + RLS por usuário/equipe.


## Automação Agendor + Asaas

Foi adicionada uma base para automação do processo comercial:

- Três funis no Kanban: `PROSPECCAO_QUALIFICACAO`, `VENDAS_PONTUAIS` e `COMODATO`.
- Webhook `POST /api/webhooks/agendor` para receber eventos de negócio fechado.
- Ao receber um negócio fechado:
  - cria/atualiza cliente no Supabase,
  - cria contrato com duração em meses,
  - cria cliente e assinatura recorrente no Asaas.

### Variáveis de ambiente adicionais

```env
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
AGENDOR_WEBHOOK_TOKEN=TOKEN_SEGURO_DO_WEBHOOK
AGENDOR_WON_STAGE_KEY=ID_DA_ETAPA_FECHADO_GANHO
ASAAS_API_KEY=SUA_CHAVE_DA_API_ASAAS
ASAAS_BASE_URL=https://api.asaas.com/v3
```

### Exemplo de payload aceito no webhook

```json
{
  "dealId": 123,
  "title": "Comodato Cliente XPTO",
  "status": "won",
  "stageKey": "fechado_ganho",
  "contractDurationMonths": 24,
  "monthlyValue": 899.90,
  "contractType": "COMODATO",
  "customer": {
    "name": "Cliente XPTO",
    "email": "financeiro@cliente.com",
    "phone": "11999999999"
  }
}
```
