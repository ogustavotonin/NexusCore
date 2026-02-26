"use client";

import { useEffect, useState } from "react";
import InternalShell from "@/components/InternalShell";
import FormCliente from "@/components/FormCliente";
import TabelaClientes from "@/components/TabelaClientes";
import { supabase } from "@/lib/supabase";
import { Client } from "@/lib/types";

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Client | null>(null);

  const load = async () => {
    const { data } = await supabase.from("clients").select("*").order("id", { ascending: false });
    setClients((data || []) as Client[]);
    setEditing(null);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <InternalShell title="Clientes">
      <div className="mb-3 card">
        <input placeholder="Buscar cliente" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <FormCliente onSaved={load} initial={editing} />
        <TabelaClientes
          clients={filtered}
          onEdit={setEditing}
          onDelete={async (id) => {
            await supabase.from("clients").delete().eq("id", id);
            await load();
          }}
        />
      </div>
    </InternalShell>
  );
}
