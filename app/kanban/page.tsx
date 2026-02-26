"use client";

import InternalShell from "@/components/InternalShell";
import KanbanBoard, { KanbanCard, KanbanColumn } from "@/components/KanbanBoard";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function KanbanPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [newCard, setNewCard] = useState({ title: "", column_id: "", client_id: "", value_estimated: "", due_date: "" });

  const load = async () => {
    const [{ data: cols }, { data: c }] = await Promise.all([
      supabase.from("kanban_columns").select("*").order("position"),
      supabase.from("kanban_cards").select("*, clients(name)").order("position")
    ]);
    setColumns((cols || []) as KanbanColumn[]);
    setCards((c || []) as unknown as KanbanCard[]);
  };

  useEffect(() => { void load(); }, []);

  return (
    <InternalShell title="Kanban">
      <form className="card grid gap-2 md:grid-cols-5 mb-4" onSubmit={async (e) => {
        e.preventDefault();
        await supabase.from("kanban_cards").insert({
          title: newCard.title,
          column_id: Number(newCard.column_id),
          client_id: newCard.client_id ? Number(newCard.client_id) : null,
          value_estimated: newCard.value_estimated ? Number(newCard.value_estimated) : null,
          due_date: newCard.due_date || null,
          position: cards.filter((ca) => ca.column_id === Number(newCard.column_id)).length + 1
        });
        setNewCard({ title: "", column_id: "", client_id: "", value_estimated: "", due_date: "" });
        await load();
      }}>
        <input placeholder="Título" value={newCard.title} onChange={(e) => setNewCard({ ...newCard, title: e.target.value })} required />
        <select value={newCard.column_id} onChange={(e) => setNewCard({ ...newCard, column_id: e.target.value })} required>
          <option value="">Coluna</option>
          {columns.map((col) => <option key={col.id} value={col.id}>{col.name}</option>)}
        </select>
        <input type="number" step="0.01" placeholder="Valor estimado" value={newCard.value_estimated} onChange={(e) => setNewCard({ ...newCard, value_estimated: e.target.value })} />
        <input type="date" value={newCard.due_date} onChange={(e) => setNewCard({ ...newCard, due_date: e.target.value })} />
        <button className="bg-slate-900 text-white">Adicionar card</button>
      </form>
      <KanbanBoard
        columns={columns}
        cards={cards}
        onMove={async (cardId, newColumnId, newPosition) => {
          await supabase.from("kanban_cards").update({ column_id: newColumnId, position: newPosition }).eq("id", cardId);
          await load();
        }}
      />
    </InternalShell>
  );
}
