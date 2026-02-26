import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NexusCore CRM MVP",
  description: "CRM + Kanban + Indicações"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
