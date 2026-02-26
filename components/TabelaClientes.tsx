"use client";

import { Client } from "@/lib/types";

export default function TabelaClientes({ clients, onEdit, onDelete }: { clients: Client[]; onEdit: (c: Client) => void; onDelete: (id: number) => void }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th>Nome</th><th>Telefone</th><th>Email</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-b">
              <td>{c.name}</td>
              <td>{c.phone}</td>
              <td>{c.email}</td>
              <td className="space-x-2 py-2">
                <button className="bg-amber-500 text-white" onClick={() => onEdit(c)}>Editar</button>
                <button className="bg-red-600 text-white" onClick={() => onDelete(c.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
