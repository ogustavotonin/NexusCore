"use client";

import InternalShell from "@/components/InternalShell";
import { supabase } from "@/lib/supabase";
import { Client, Contract } from "@/lib/types";
import { useEffect, useState } from "react";

const empty = { client_id: "", description: "", start_date: "", end_date: "", status: "ATIVO", monthly_value: "", referred_by_client_id: "" };

export default function ContratosPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const [{ data: cts }, { data: cls }] = await Promise.all([
      supabase.from("contracts").select("*, clients(name)").order("id", { ascending: false }),
      supabase.from("clients").select("*").order("name")
    ]);
    setContracts((cts || []) as unknown as Contract[]);
    setClients((cls || []) as Client[]);
  };

  useEffect(() => { void load(); }, []);

  return (
    <InternalShell title="CRM - Contratos de Comodato">
      <form
        className="card grid gap-3 md:grid-cols-3 mb-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await supabase.from("contracts").insert({
            client_id: Number(form.client_id),
            description: form.description,
            start_date: form.start_date,
            end_date: form.end_date || null,
            status: form.status,
            monthly_value: form.monthly_value ? Number(form.monthly_value) : null,
            referred_by_client_id: form.referred_by_client_id ? Number(form.referred_by_client_id) : null
          });
          setForm(empty);
          await load();
        }}
      >
        <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} required>
          <option value="">Cliente</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
        <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="ATIVO">ATIVO</option>
          <option value="INATIVO">INATIVO</option>
        </select>
        <input type="number" step="0.01" placeholder="Valor mensal" value={form.monthly_value} onChange={(e) => setForm({ ...form, monthly_value: e.target.value })} />
        <select value={form.referred_by_client_id} onChange={(e) => setForm({ ...form, referred_by_client_id: e.target.value })}>
          <option value="">Indicado por (opcional)</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="bg-slate-900 text-white">Criar contrato</button>
      </form>

      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th>Cliente</th><th>Descrição</th><th>Status</th><th>Valor</th><th>Indicado por</th></tr></thead>
          <tbody>
            {contracts.map((ct) => (
              <tr key={ct.id} className="border-b">
                <td>{ct.clients?.name}</td>
                <td>{ct.description}</td>
                <td>{ct.status}</td>
                <td>{ct.monthly_value ?? "-"}</td>
                <td>{clients.find((c) => c.id === ct.referred_by_client_id)?.name ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </InternalShell>
  );
}
