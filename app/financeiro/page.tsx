"use client";

import InternalShell from "@/components/InternalShell";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Entry = {
  id: number;
  title: string;
  type: "PAGAR" | "RECEBER";
  amount: number;
  due_date: string;
  status: "PENDENTE" | "PAGO" | "RECEBIDO";
  client_id: number | null;
  notes: string | null;
  clients?: { name: string } | null;
};

type Client = { id: number; name: string };

const emptyForm = {
  title: "",
  type: "PAGAR",
  amount: "",
  due_date: "",
  status: "PENDENTE",
  client_id: "",
  notes: ""
};

export default function FinanceiroPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const [{ data: e }, { data: c }] = await Promise.all([
      supabase.from("financial_entries").select("*, clients(name)").order("due_date", { ascending: true }),
      supabase.from("clients").select("id,name").order("name")
    ]);
    setEntries((e || []) as unknown as Entry[]);
    setClients((c || []) as Client[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = entries.filter((entry) => {
    const term = search.toLowerCase();
    return entry.title.toLowerCase().includes(term) || (entry.clients?.name || "").toLowerCase().includes(term);
  });

  const totalPagar = filtered.filter((e) => e.type === "PAGAR" && e.status === "PENDENTE").reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const totalReceber = filtered.filter((e) => e.type === "RECEBER" && e.status === "PENDENTE").reduce((acc, e) => acc + Number(e.amount || 0), 0);

  return (
    <InternalShell title="Financeiro - Contas a Pagar e Receber">
      <div className="grid gap-3 md:grid-cols-2 mb-4">
        <article className="card">
          <p className="text-sm text-slate-500">Total pendente a pagar</p>
          <p className="text-xl font-semibold text-red-700">R$ {totalPagar.toFixed(2)}</p>
        </article>
        <article className="card">
          <p className="text-sm text-slate-500">Total pendente a receber</p>
          <p className="text-xl font-semibold text-green-700">R$ {totalReceber.toFixed(2)}</p>
        </article>
      </div>

      <form
        className="card grid gap-3 md:grid-cols-3 mb-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await supabase.from("financial_entries").insert({
            title: form.title,
            type: form.type,
            amount: Number(form.amount),
            due_date: form.due_date,
            status: form.status,
            client_id: form.client_id ? Number(form.client_id) : null,
            notes: form.notes || null
          });
          setForm(emptyForm);
          await load();
        }}
      >
        <input placeholder="Descrição da conta" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "PAGAR" | "RECEBER" })}>
          <option value="PAGAR">Pagar</option>
          <option value="RECEBER">Receber</option>
        </select>
        <input type="number" min="0" step="0.01" placeholder="Valor" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "PENDENTE" | "PAGO" | "RECEBIDO" })}>
          <option value="PENDENTE">Pendente</option>
          <option value="PAGO">Pago</option>
          <option value="RECEBIDO">Recebido</option>
        </select>
        <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
          <option value="">Cliente (opcional)</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
        <input placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="bg-slate-900 text-white">Salvar lançamento</button>
      </form>

      <div className="card mb-3">
        <input placeholder="Buscar por título ou cliente" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th>Título</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th>Cliente</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} className="border-b">
                <td>{entry.title}</td>
                <td>{entry.type}</td>
                <td>R$ {Number(entry.amount).toFixed(2)}</td>
                <td>{entry.due_date}</td>
                <td>{entry.status}</td>
                <td>{entry.clients?.name ?? "-"}</td>
                <td className="py-2">
                  <button
                    className="bg-amber-500 text-white"
                    onClick={async () => {
                      const nextStatus = entry.type === "PAGAR" ? "PAGO" : "RECEBIDO";
                      await supabase.from("financial_entries").update({ status: nextStatus }).eq("id", entry.id);
                      await load();
                    }}
                  >
                    Marcar quitado
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </InternalShell>
  );
}
