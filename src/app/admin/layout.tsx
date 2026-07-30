import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <Link href="/admin/productos" className="font-heading text-xl font-bold text-white">
          Panel de administración<span className="text-vt-accent">.</span>
        </Link>
        <nav className="flex items-center gap-5 text-[13px] font-semibold">
          <Link href="/admin/productos" className="text-vt-muted-1 hover:text-vt-accent">
            Productos
          </Link>
          <Link href="/admin/categorias" className="text-vt-muted-1 hover:text-vt-accent">
            Categorías y marcas
          </Link>
          <Link href="/" className="text-vt-muted-1 hover:text-vt-accent">
            ← Volver a la tienda
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
