"use client";

import InternalShell from "@/components/InternalShell";
import IndicationsSummary from "@/components/IndicationsSummary";
import { supabase } from "@/lib/supabase";
import { Client, Contract } from "@/lib/types";
import { useEffect, useState } from "react";

export default function IndicacoesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);

  const load = async () => {
    const [{ data: cls }, { data: cts }] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("contracts").select("*")
    ]);
    setClients((cls || []) as Client[]);
    setContracts((cts || []) as Contract[]);
  };

  useEffect(() => { void load(); }, []);

  return (
    <InternalShell title="Indicações e Resumo de Descontos">
      <div className="grid gap-3 md:grid-cols-2">
        {clients.map((client) => <IndicationsSummary key={client.id} client={client} contracts={contracts} />)}
      </div>
    </InternalShell>
  );
}
