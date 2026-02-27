"use client";

import InternalShell from "@/components/InternalShell";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type PS = { id: number; name: string; type: "PRODUTO" | "SERVICO"; price: number; description: string; active: boolean };

export default function ProdutosServicosPage() {
  const [items, setItems] = useState<PS[]>([]);
  const [form, setForm] = useState({ name: "", type: "PRODUTO", price: "", description: "", active: true });

  const load = async () => {
    const { data } = await supabase.from("products_services").select("*").order("id", { ascending: false });
    setItems((data || []) as PS[]);
  };

  useEffect(() => { void load(); }, []);

  return (
    <InternalShell title="Produtos & Serviços">
      <form className="card grid gap-3 md:grid-cols-3 mb-4" onSubmit={async (e) => {
        e.preventDefault();
        await supabase.from("products_services").insert({ ...form, price: Number(form.price) });
        setForm({ name: "", type: "PRODUTO", price: "", description: "", active: true });
        await load();
      }}>
        <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "PRODUTO" | "SERVICO" })}><option value="PRODUTO">Produto</option><option value="SERVICO">Serviço</option></select>
        <input type="number" step="0.01" placeholder="Preço" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Ativo</label>
        <button className="bg-slate-900 text-white">Salvar</button>
      </form>
      <div className="card grid gap-2">
        {items.map((item) => (
          <div key={item.id} className="border rounded p-2 flex justify-between">
            <div><strong>{item.name}</strong> ({item.type}) - R$ {item.price}</div>
            <button className="bg-red-600 text-white" onClick={async () => { await supabase.from("products_services").delete().eq("id", item.id); await load(); }}>Excluir</button>
          </div>
        ))}
      </div>
    </InternalShell>
  );
}
