"use client";

import InternalShell from "@/components/InternalShell";
import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";

type EntryStatus = "PENDENTE" | "PAGO" | "RECEBIDO";
type EntryType = "PAGAR" | "RECEBER";

type Entry = {
  id: number;
  title: string;
  type: EntryType;
  amount: number;
  due_date: string;
  status: EntryStatus;
  client_id: number | null;
  notes: string | null;
  clients?: { name: string } | null;
};

type Client = { id: number; name: string };

type FormState = {
  title: string;
  type: EntryType;
  amount: string;
  due_date: string;
  status: EntryStatus;
  client_id: string;
  notes: string;
};

const defaultForm: FormState = {
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
  const [typeFilter, setTypeFilter] = useState<"TODOS" | EntryType>("TODOS");
  const [statusFilter, setStatusFilter] = useState<"TODOS" | EntryStatus>("TODOS");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);

  const load = async () => {
    const [{ data: financialEntries }, { data: clientList }] = await Promise.all([
      supabase.from("financial_entries").select("*, clients(name)").order("due_date", { ascending: true }),
      supabase.from("clients").select("id,name").order("name")
    ]);

    setEntries((financialEntries || []) as unknown as Entry[]);
    setClients((clientList || []) as Client[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      const term = search.toLowerCase();
      const matchesSearch = entry.title.toLowerCase().includes(term) || (entry.clients?.name || "").toLowerCase().includes(term);
      const matchesType = typeFilter === "TODOS" || entry.type === typeFilter;
      const matchesStatus = statusFilter === "TODOS" || entry.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [entries, search, statusFilter, typeFilter]);

  const totals = useMemo(() => {
    return {
      pagarPendente: filtered.filter((entry) => entry.type === "PAGAR" && entry.status === "PENDENTE").reduce((acc, entry) => acc + Number(entry.amount || 0), 0),
      receberPendente: filtered.filter((entry) => entry.type === "RECEBER" && entry.status === "PENDENTE").reduce((acc, entry) => acc + Number(entry.amount || 0), 0)
    };
  }, [filtered]);

  const saveEntry = async () => {
    const payload = {
      title: form.title,
      type: form.type,
      amount: Number(form.amount),
      due_date: form.due_date,
      status: form.status,
      client_id: form.client_id ? Number(form.client_id) : null,
      notes: form.notes || null
    };

    if (editingId) {
      await supabase.from("financial_entries").update(payload).eq("id", editingId);
    } else {
      await supabase.from("financial_entries").insert(payload);
    }

    resetForm();
    await load();
  };

  const startEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setForm({
      title: entry.title,
      type: entry.type,
      amount: String(entry.amount),
      due_date: entry.due_date,
      status: entry.status,
      client_id: entry.client_id ? String(entry.client_id) : "",
      notes: entry.notes || ""
    });
  };

  return (
    <InternalShell title="Financeiro - Contas a Pagar e Receber">
      <div className="grid gap-3 md:grid-cols-2 mb-4">
        <article className="card">
          <p className="text-sm text-slate-500">Total pendente a pagar</p>
          <p className="text-xl font-semibold text-red-700">R$ {totals.pagarPendente.toFixed(2)}</p>
        </article>
        <article className="card">
          <p className="text-sm text-slate-500">Total pendente a receber</p>
          <p className="text-xl font-semibold text-green-700">R$ {totals.receberPendente.toFixed(2)}</p>
        </article>
      </div>

      <form
        className="card grid gap-3 md:grid-cols-3 mb-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await saveEntry();
        }}
      >
        <input placeholder="Descrição da conta" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />

        <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as EntryType })}>
          <option value="PAGAR">Pagar</option>
          <option value="RECEBER">Receber</option>
        </select>

        <input type="number" min="0" step="0.01" placeholder="Valor" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />

        <input type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} required />

        <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EntryStatus })}>
          <option value="PENDENTE">Pendente</option>
          <option value="PAGO">Pago</option>
          <option value="RECEBIDO">Recebido</option>
        </select>

        <select value={form.client_id} onChange={(event) => setForm({ ...form, client_id: event.target.value })}>
          <option value="">Cliente (opcional)</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>

        <input placeholder="Observações" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />

        <div className="flex gap-2">
          <button className="bg-slate-900 text-white">{editingId ? "Atualizar lançamento" : "Salvar lançamento"}</button>
          {editingId ? (
            <button type="button" className="bg-slate-300" onClick={resetForm}>
              Cancelar edição
            </button>
          ) : null}
        </div>
      </form>

      <section className="card mb-3 grid gap-3 md:grid-cols-3">
        <input placeholder="Buscar por título ou cliente" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "TODOS" | EntryType)}>
          <option value="TODOS">Todos os tipos</option>
          <option value="PAGAR">Pagar</option>
          <option value="RECEBER">Receber</option>
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "TODOS" | EntryStatus)}>
          <option value="TODOS">Todos os status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PAGO">Pago</option>
          <option value="RECEBIDO">Recebido</option>
        </select>
      </section>

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
                  <div className="flex flex-wrap gap-2">
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
                    <button className="bg-sky-700 text-white" onClick={() => startEdit(entry)}>
                      Editar
                    </button>
                    <button
                      className="bg-red-700 text-white"
                      onClick={async () => {
                        await supabase.from("financial_entries").delete().eq("id", entry.id);
                        if (editingId === entry.id) {
                          resetForm();
                        }
                        await load();
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </InternalShell>
  );
}
