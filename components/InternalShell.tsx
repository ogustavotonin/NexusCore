import MenuHamburguer from "./MenuHamburguer";

export default function InternalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl p-4">
      <MenuHamburguer />
      <h2 className="page-title mb-4">{title}</h2>
      {children}
    </main>
  );
}
