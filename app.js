const kpis = [
  { title: "Pipeline CRM", value: "7 leads", detail: "R$ 229k em negociação", delta: "+12%" },
  { title: "Orçamentos", value: "5", detail: "2 aprovados · 2 pendentes", delta: "+6%" },
  { title: "Ordens de Serviço", value: "4", detail: "1 em andamento", delta: "+4%" },
  { title: "Lucro Mensal", value: "R$ 12,3k", detail: "Fevereiro 2026", delta: "+15%" },
  { title: "Clientes Ativos", value: "48", detail: "7 novos este mês", delta: "+8%" },
  { title: "Itens Estoque", value: "100", detail: "2 abaixo do mínimo", delta: "-2%" },
  { title: "Receita Recorrente", value: "R$ 2.500/mês", detail: "5 contratos ativos", delta: "+10%" }
];

const activities = [
  ["Novo lead adicionado ao pipeline", "Roberto Lima", "Há 1h"],
  ["OS-1042 finalizada", "Aceite digital assinado", "Há 2h"],
  ["Pagamento recebido", "João Silva · R$ 12.500", "Há 3h"],
  ["Orçamento ORC-005 aprovado", "R$ 28.900", "Há 4h"],
  ["Estoque baixo", "Câmera IP 4MP dome (2 un.)", "Há 5h"]
];

const orders = [
  { code: "OS-1041", client: "João Silva", type: "Automação iluminação", status: "Em andamento", className: "progress" },
  { code: "OS-1043", client: "Carlos Mendes", type: "Automação cortinas", status: "Aguardando material", className: "material" },
  { code: "OS-1044", client: "Ana Oliveira", type: "Sistema de som 4 zonas", status: "Agendada", className: "scheduled" }
];

const kpiCards = document.getElementById("kpiCards");
const activityList = document.getElementById("activityList");
const ordersList = document.getElementById("ordersList");

function renderCards() {
  kpiCards.innerHTML = "";

  kpis.forEach((kpi) => {
    const article = document.createElement("article");
    article.className = "card";
    article.innerHTML = `
      <h5>${kpi.title}</h5>
      <p class="value">${kpi.value}</p>
      <p>${kpi.detail}</p>
      <span class="badge">${kpi.delta}</span>
    `;
    kpiCards.appendChild(article);
  });
}

function renderActivities() {
  activityList.innerHTML = "";
  activities.forEach(([main, secondary, when]) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${main} - ${secondary}</strong><span>${when}</span>`;
    activityList.appendChild(item);
  });
}

function renderOrders() {
  ordersList.innerHTML = "";
  orders.forEach((order) => {
    const card = document.createElement("article");
    card.className = "order-card";
    card.innerHTML = `
      <div class="order-header">
        <strong>${order.code}</strong>
        <span class="status ${order.className}">${order.status}</span>
      </div>
      <div>${order.client}</div>
      <small>${order.type}</small>
    `;
    ordersList.appendChild(card);
  });
}

function shuffleDeltas() {
  kpis.forEach((kpi) => {
    const random = (Math.random() * 5 + 1).toFixed(0);
    const signal = Math.random() > 0.3 ? "+" : "-";
    kpi.delta = `${signal}${random}%`;
  });

  renderCards();
}

document.getElementById("refreshBtn").addEventListener("click", shuffleDeltas);

renderCards();
renderActivities();
renderOrders();
