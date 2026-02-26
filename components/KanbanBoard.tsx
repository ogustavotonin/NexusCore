"use client";

import { useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type KanbanColumn = { id: number; name: string; position: number };
export type KanbanCard = { id: number; title: string; column_id: number; client_id: number | null; value_estimated: number | null; owner_user_id: number | null; due_date: string | null; clients?: { name: string } | null };

function SortableCard({ card }: { card: KanbanCard }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="rounded border bg-white p-2 text-sm shadow-sm">
      <p className="font-semibold">{card.title}</p>
      <p>Cliente: {card.clients?.name ?? "-"}</p>
      <p>Valor: {card.value_estimated ?? "-"}</p>
      <p>Data: {card.due_date ?? "-"}</p>
    </div>
  );
}

export default function KanbanBoard({ columns, cards, onMove }: { columns: KanbanColumn[]; cards: KanbanCard[]; onMove: (cardId: number, newColumnId: number, newPosition: number) => Promise<void> }) {
  const sensors = useSensors(useSensor(PointerSensor));
  const cardsByColumn = useMemo(() => {
    return columns.reduce<Record<number, KanbanCard[]>>((acc, column) => {
      acc[column.id] = cards.filter((card) => card.column_id === column.id).sort((a, b) => a.id - b.id);
      return acc;
    }, {});
  }, [columns, cards]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeCard = cards.find((card) => card.id === Number(active.id));
    if (!activeCard) return;

    const overCard = cards.find((card) => card.id === Number(over.id));
    const newColumnId = overCard?.column_id ?? activeCard.column_id;

    const currentCards = cardsByColumn[newColumnId] || [];
    const oldIndex = currentCards.findIndex((card) => card.id === activeCard.id);
    const newIndex = overCard ? currentCards.findIndex((card) => card.id === overCard.id) : currentCards.length - 1;
    const sorted = arrayMove(currentCards, Math.max(oldIndex, 0), Math.max(newIndex, 0));

    const position = sorted.findIndex((card) => card.id === activeCard.id);
    await onMove(activeCard.id, newColumnId, position + 1);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid gap-3 md:grid-cols-5">
        {columns.map((column) => (
          <section key={column.id} className="rounded border bg-slate-100 p-2">
            <h3 className="font-semibold mb-2">{column.name}</h3>
            <SortableContext items={(cardsByColumn[column.id] || []).map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 min-h-40">
                {(cardsByColumn[column.id] || []).map((card) => <SortableCard key={card.id} card={card} />)}
              </div>
            </SortableContext>
          </section>
        ))}
      </div>
    </DndContext>
  );
}
