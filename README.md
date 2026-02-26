# CrystalCaverns

Protótipo de **sistema de gestão web** inspirado no layout enviado (menu lateral, cards KPI, atividades e ordens de serviço).

## O que este projeto é (e o que ainda não é)

- ✅ É um **front-end estático** (HTML/CSS/JS) que abre no navegador.
- ✅ Pode rodar em qualquer servidor web (Nginx/Apache/Caddy) ou Docker.
- ⚠️ Ainda não possui login, backend e banco de dados (é um protótipo visual funcional).

## Estrutura dos arquivos

- `index.html` → estrutura da tela
- `styles.css` → visual/estilos
- `app.js` → dados simulados e renderização dos cards/listas
- `Dockerfile` → empacota em Nginx

---

## Como usar agora (modo rápido)

Na pasta do projeto, rode:

```bash
python3 -m http.server 8080
```

Abra no navegador:

- `http://SEU_IP_DO_SERVIDOR:8080`
- Exemplo local: `http://localhost:8080`

> Se estiver em VPS/cloud, libere a porta **8080** no firewall/security group.

---

## Como usar com Docker (recomendado para servidor)

```bash
docker build -t crystal-caverns-dashboard .
docker run -d --name crystal-dashboard -p 8080:80 --restart unless-stopped crystal-caverns-dashboard
```

Acesse:

- `http://SEU_IP_DO_SERVIDOR:8080`

Comandos úteis:

```bash
docker logs -f crystal-dashboard
docker ps
docker stop crystal-dashboard
docker rm crystal-dashboard
```

---

## Deploy em produção (domínio + HTTPS)

### Opção A — manter Docker na porta 8080 + Nginx como proxy

1. Deixe o container rodando (`-p 8080:80`).
2. Instale Nginx no servidor.
3. Crie um bloco de servidor apontando para `127.0.0.1:8080`.
4. Ative SSL com Certbot.

Exemplo de `server` Nginx (resumo):

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Depois:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Opção B — sem Docker

Publique os arquivos (`index.html`, `styles.css`, `app.js`) na raiz pública do Nginx/Apache.

---

## Problemas comuns

- **Não abre externamente**: porta 8080 bloqueada no firewall/cloud.
- **Abre só no localhost**: você está acessando `localhost` de outra máquina (use IP público do servidor).
- **Mudou arquivos e não refletiu**: limpe cache do navegador (Ctrl+F5).

---

## Próximos passos recomendados

Para virar um sistema real de produção:

1. Adicionar autenticação (login + perfis de usuário).
2. Criar backend (Node/Nest/Express, Python/FastAPI, etc.).
3. Conectar banco de dados (PostgreSQL).
4. Implementar CRUD de clientes, orçamentos e OS.
5. Criar API para os KPIs do dashboard.
6. Configurar logs, backup, monitoramento e observabilidade.
