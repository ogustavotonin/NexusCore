"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { clearSession } from "@/lib/auth";

const items = [
  ["Dashboard", "/dashboard"],
  ["Kanban", "/kanban"],
  ["Clientes", "/clientes"],
  ["CRM (Contratos)", "/crm/contratos"],
  ["Indicações", "/indicacoes"],
  ["Produtos & Serviços", "/produtos-servicos"]
] as const;

export default function MenuHamburguer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="mb-4 bg-slate-900 text-white rounded-lg p-3">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold">NexusCore</h1>
        <button className="bg-slate-700" onClick={() => setOpen((v) => !v)}>
          ☰ Menu
        </button>
      </div>
      {open && (
        <nav className="mt-3 flex flex-col gap-2">
          {items.map(([label, href]) => (
            <Link key={href} href={href} className={clsx("rounded p-2", pathname.startsWith(href) ? "bg-slate-700" : "bg-slate-800")}>
              {label}
            </Link>
          ))}
          <button
            className="bg-red-700 text-left"
            onClick={() => {
              clearSession();
              router.push("/login");
            }}
          >
            Sair
          </button>
        </nav>
      )}
    </header>
  );
}
