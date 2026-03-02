"use client";

import { useEffect, useState } from "react";
import InternalShell from "@/components/InternalShell";
import { supabase } from "@/lib/supabase";

type Metric = { label: string; value: string | number };

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    const load = async () => {
      const [clients, contracts, indications, cards, financialPending] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("contracts").select("id", { count: "exact", head: true }).eq("status", "ATIVO"),
        supabase.from("contracts").select("id", { count: "exact", head: true }).eq("status", "ATIVO").not("referred_by_client_id", "is", null),
        supabase.from("kanban_cards").select("id,column_id"),
        supabase.from("financial_entries").select("id", { count: "exact", head: true }).eq("status", "PENDENTE")
      ]);

      const cardsByColumn = (cards.data || []).reduce((acc: Record<string, number>, card) => {
        acc[card.column_id] = (acc[card.column_id] || 0) + 1;
        return acc;
      }, {});

      setMetrics([
        { label: "Clientes", value: clients.count ?? 0 },
        { label: "Contratos Ativos", value: contracts.count ?? 0 },
        { label: "Indicações Ativas", value: indications.count ?? 0 },
        { label: "Cards Kanban", value: (cards.data || []).length },
        { label: "Cards por coluna", value: Object.entries(cardsByColumn).map(([k, v]) => `${k}: ${v}`).join(" | ") || "Sem cards" },
        { label: "Financeiro pendente", value: financialPending.count ?? 0 }
      ]);
    };

    void load();
  }, []);

  return (
    <InternalShell title="Dashboard">
      <div className="grid gap-3 md:grid-cols-2">
        {metrics.map((m) => (
          <article key={m.label} className="card">
            <p className="text-sm text-slate-500">{m.label}</p>
            <p className="text-xl font-semibold">{m.value}</p>
          </article>
        ))}
      </div>
    </InternalShell>
  );
}
