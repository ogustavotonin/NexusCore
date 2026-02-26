# CrystalCaverns

App de gestão para **rodar no Windows** e usar **base de dados compartilhada no Supabase**.

## O que foi entregue

- Interface web (HTML/CSS/JS) para cadastro de:
  - Clientes
  - Ordens de serviço
- Dashboard com métricas em tempo real (clientes, ordens, em andamento e faturamento).
- Conexão direta com Supabase (URL + ANON KEY).
- Atualização em tempo real via Realtime (postgres_changes).

## 1) Criar as tabelas no Supabase

No painel do Supabase, abra **SQL Editor** e execute o arquivo:

- `supabase/schema.sql`

Esse script cria:

- `public.clientes`
- `public.ordens_servico`
- policies de RLS para leitura/escrita
- inclusão das tabelas no Realtime

## 2) Rodar no Windows

### Opção A (mais simples): Python

No PowerShell, dentro da pasta do projeto:

```powershell
python -m http.server 8080
```

Abra no navegador:

- `http://localhost:8080`

### Opção B: Node

```powershell
npx serve . -l 8080
```

## 3) Conectar no Supabase dentro do app

Ao abrir a página:

1. Cole a **Supabase URL**
2. Cole a **Supabase Anon Key**
3. Clique em **Conectar**

Onde achar esses dados:

- Supabase Project Settings → API

## 4) Uso compartilhado (vários PCs Windows)

Para várias máquinas usarem o mesmo banco:

1. Publique este app em um servidor (ou rode em uma máquina central)
2. Cada usuário acessa a URL pelo navegador
3. Todos apontam para o mesmo projeto Supabase

Assim, os registros ficam compartilhados entre todos.

## 5) Deploy com Docker (opcional)

```bash
docker build -t crystal-caverns-dashboard .
docker run -d --name crystal-dashboard -p 8080:80 --restart unless-stopped crystal-caverns-dashboard
```

## Observação de segurança

Este projeto usa ANON KEY no front-end (padrão de apps web com Supabase).
Para produção real, recomenda-se:

- endurecer políticas RLS por usuário/empresa
- autenticação com Supabase Auth
- perfis e regras por tenant
