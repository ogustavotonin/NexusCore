const STORAGE_KEY = "nexus_supabase_config";

const metricsEl = document.getElementById("metrics");
const clientsList = document.getElementById("clientsList");
const ordersList = document.getElementById("ordersList");
const connectionStatus = document.getElementById("connectionStatus");

const configForm = document.getElementById("configForm");
const disconnectBtn = document.getElementById("disconnectBtn");
const reloadDataBtn = document.getElementById("reloadDataBtn");

let supabase = null;
let channel = null;

function setStatus(message, ok = false) {
  connectionStatus.textContent = message;
  connectionStatus.style.color = ok ? "#148a4b" : "#b42318";
}

function getConfig() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveConfig(url, anonKey) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, anonKey }));
}

function clearConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

function renderMetrics(items) {
  metricsEl.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "metric";
    card.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong>`;
    metricsEl.appendChild(card);
  });
}

function currency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

async function loadData() {
  if (!supabase) return;

  const [{ data: clients, error: clientsError }, { data: orders, error: ordersError }] = await Promise.all([
    supabase.from("clientes").select("id,nome,email,telefone,created_at").order("created_at", { ascending: false }).limit(30),
    supabase.from("ordens_servico").select("id,titulo,status,valor,created_at").order("created_at", { ascending: false }).limit(30)
  ]);

  if (clientsError || ordersError) {
    setStatus(`Erro ao carregar: ${clientsError?.message || ordersError?.message}`);
    return;
  }

  const totalValor = (orders || []).reduce((acc, row) => acc + Number(row.valor || 0), 0);
  renderMetrics([
    { label: "Clientes", value: clients.length },
    { label: "Ordens", value: orders.length },
    { label: "Em andamento", value: orders.filter((o) => o.status === "Em andamento").length },
    { label: "Faturamento", value: currency(totalValor) }
  ]);

  clientsList.innerHTML = "";
  (clients || []).forEach((row) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${row.nome}</strong><div>${row.email}</div><small>${row.telefone}</small>`;
    clientsList.appendChild(li);
  });

  ordersList.innerHTML = "";
  (orders || []).forEach((row) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${row.titulo}</strong><div>Status: ${row.status}</div><small>${currency(row.valor)}</small>`;
    ordersList.appendChild(li);
  });

  setStatus("Conectado e sincronizado com Supabase.", true);
}

function attachRealtime() {
  if (!supabase) return;
  if (channel) supabase.removeChannel(channel);

  channel = supabase
    .channel("db-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "clientes" }, loadData)
    .on("postgres_changes", { event: "*", schema: "public", table: "ordens_servico" }, loadData)
    .subscribe();
}

async function connect(url, anonKey) {
  try {
    supabase = window.supabase.createClient(url, anonKey);
    await loadData();
    attachRealtime();
  } catch (error) {
    setStatus(`Falha de conexão: ${error.message}`);
  }
}

configForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = document.getElementById("supabaseUrl").value.trim();
  const anonKey = document.getElementById("supabaseAnonKey").value.trim();

  saveConfig(url, anonKey);
  await connect(url, anonKey);
});

disconnectBtn.addEventListener("click", () => {
  clearConfig();
  if (channel && supabase) supabase.removeChannel(channel);
  supabase = null;
  renderMetrics([
    { label: "Clientes", value: 0 },
    { label: "Ordens", value: 0 },
    { label: "Em andamento", value: 0 },
    { label: "Faturamento", value: currency(0) }
  ]);
  clientsList.innerHTML = "";
  ordersList.innerHTML = "";
  setStatus("Desconectado.");
});

reloadDataBtn.addEventListener("click", loadData);

document.getElementById("clientForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabase) return setStatus("Conecte ao Supabase primeiro.");

  const payload = {
    nome: document.getElementById("clientName").value.trim(),
    email: document.getElementById("clientEmail").value.trim(),
    telefone: document.getElementById("clientPhone").value.trim()
  };

  const { error } = await supabase.from("clientes").insert(payload);
  if (error) return setStatus(`Erro ao salvar cliente: ${error.message}`);

  event.target.reset();
  await loadData();
});

document.getElementById("orderForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabase) return setStatus("Conecte ao Supabase primeiro.");

  const payload = {
    titulo: document.getElementById("orderTitle").value.trim(),
    status: document.getElementById("orderStatus").value,
    valor: Number(document.getElementById("orderValue").value)
  };

  const { error } = await supabase.from("ordens_servico").insert(payload);
  if (error) return setStatus(`Erro ao salvar OS: ${error.message}`);

  event.target.reset();
  await loadData();
});

(function init() {
  renderMetrics([
    { label: "Clientes", value: 0 },
    { label: "Ordens", value: 0 },
    { label: "Em andamento", value: 0 },
    { label: "Faturamento", value: currency(0) }
  ]);

  const cfg = getConfig();
  if (!cfg) {
    setStatus("Não conectado.");
    return;
  }

  document.getElementById("supabaseUrl").value = cfg.url;
  document.getElementById("supabaseAnonKey").value = cfg.anonKey;
  connect(cfg.url, cfg.anonKey);
})();
