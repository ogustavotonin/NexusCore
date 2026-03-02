"use client";

import InternalShell from "@/components/InternalShell";
import KanbanBoard, { KanbanCard, KanbanColumn } from "@/components/KanbanBoard";
import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";

const funnels = [
  { value: "PROSPECCAO_QUALIFICACAO", label: "Prospecção e qualificação" },
  { value: "VENDAS_PONTUAIS", label: "Vendas pontuais" },
  { value: "COMODATO", label: "Comodato" }
] as const;

type Funnel = (typeof funnels)[number]["value"];

export default function KanbanPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel>("PROSPECCAO_QUALIFICACAO");
  const [newCard, setNewCard] = useState({ title: "", column_id: "", client_id: "", value_estimated: "", due_date: "" });

  const load = async () => {
    const [{ data: cols }, { data: c }] = await Promise.all([
      supabase.from("kanban_columns").select("*").order("position"),
      supabase.from("kanban_cards").select("*, clients(name), kanban_columns(funnel)").order("position")
    ]);
    setColumns((cols || []) as KanbanColumn[]);
    setCards((c || []) as unknown as KanbanCard[]);
  };

  const filteredColumns = useMemo(
    () => columns.filter((column) => column.funnel === selectedFunnel),
    [columns, selectedFunnel]
  );

  const filteredCards = useMemo(
    () => cards.filter((card) => card.kanban_columns?.funnel === selectedFunnel),
    [cards, selectedFunnel]
  );

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    setNewCard((current) => ({ ...current, column_id: "" }));
  }, [selectedFunnel]);

  return (
    <InternalShell title="Kanban">
      <div className="card mb-4">
        <label className="block text-sm font-medium mb-1">Funil ativo</label>
        <select value={selectedFunnel} onChange={(e) => setSelectedFunnel(e.target.value as Funnel)}>
          {funnels.map((funnel) => (
            <option key={funnel.value} value={funnel.value}>{funnel.label}</option>
          ))}
        </select>
      </div>

      <form className="card grid gap-2 md:grid-cols-5 mb-4" onSubmit={async (e) => {
        e.preventDefault();
        await supabase.from("kanban_cards").insert({
          title: newCard.title,
          column_id: Number(newCard.column_id),
          client_id: newCard.client_id ? Number(newCard.client_id) : null,
          value_estimated: newCard.value_estimated ? Number(newCard.value_estimated) : null,
          due_date: newCard.due_date || null,
          position: filteredCards.filter((ca) => ca.column_id === Number(newCard.column_id)).length + 1
        });
        setNewCard({ title: "", column_id: "", client_id: "", value_estimated: "", due_date: "" });
        await load();
      }}>
        <input placeholder="Título" value={newCard.title} onChange={(e) => setNewCard({ ...newCard, title: e.target.value })} required />
        <select value={newCard.column_id} onChange={(e) => setNewCard({ ...newCard, column_id: e.target.value })} required>
          <option value="">Coluna</option>
          {filteredColumns.map((col) => <option key={col.id} value={col.id}>{col.name}</option>)}
        </select>
        <input type="number" step="0.01" placeholder="Valor estimado" value={newCard.value_estimated} onChange={(e) => setNewCard({ ...newCard, value_estimated: e.target.value })} />
        <input type="date" value={newCard.due_date} onChange={(e) => setNewCard({ ...newCard, due_date: e.target.value })} />
        <button className="bg-slate-900 text-white">Adicionar card</button>
      </form>
      <KanbanBoard
        columns={filteredColumns}
        cards={filteredCards}
        onMove={async (cardId, newColumnId, newPosition) => {
          await supabase.from("kanban_cards").update({ column_id: newColumnId, position: newPosition }).eq("id", cardId);
          await load();
        }}
      />
    </InternalShell>
  );
}
