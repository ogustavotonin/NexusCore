"use client";

import { Client, Contract } from "@/lib/types";

export default function IndicationsSummary({ client, contracts }: { client: Client; contracts: Contract[] }) {
  const activeContracts = contracts.filter((ct) => ct.status === "ATIVO" && ct.referred_by_client_id === client.id);
  const discountPercent = activeContracts.length * 10;

  return (
    <article className="card">
      <h3 className="font-semibold">{client.name}</h3>
      <p>Contratos indicados ATIVOS: {activeContracts.length}</p>
      <p>Desconto total: {discountPercent}%</p>
      <ul className="list-disc ml-5 mt-2">
        {activeContracts.map((ct) => (
          <li key={ct.id}>{ct.description} (Contrato #{ct.id})</li>
        ))}
      </ul>
    </article>
  );
}
