import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-8">
      <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
        <Link href="/admin/productos" className="font-heading text-xl font-bold text-white">
          Panel de administración<span className="text-vt-accent">.</span>
        </Link>
        <Link href="/" className="text-[13px] font-semibold text-vt-muted-1 hover:text-vt-accent">
          ← Volver a la tienda
        </Link>
      </div>
      {children}
    </div>
  );
}
