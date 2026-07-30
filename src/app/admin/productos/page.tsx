import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/money";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { Icon } from "@/components/Icon";
import { resolveProductIcon } from "@/lib/product-icon";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string }>;
}) {
  const { q, error } = await searchParams;

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { category: true, brand: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-white">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-[10px] bg-vt-accent px-5 py-2.5 text-sm font-bold text-vt-accent-fg"
        >
          + Nuevo producto
        </Link>
      </div>

      <form className="mt-6" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nombre o SKU..."
          className="w-full max-w-md rounded-[99px] border border-white/10 bg-white/[.06] px-4 py-2.5 text-sm text-vt-fg placeholder:text-vt-muted-2"
        />
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-vt-error/30 bg-vt-error/10 px-4 py-3 text-[13px] text-vt-error">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/10 text-vt-muted-2">
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Categoría</th>
              <th className="px-4 py-3 font-semibold">Marca</th>
              <th className="px-4 py-3 font-semibold">Precio</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/5 last:border-none">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 flex-none place-items-center overflow-hidden rounded-lg bg-white/[.05] text-vt-muted-2">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Icon
                          name={resolveProductIcon(p.icon, p.category.name)}
                          className="h-[18px] w-[18px]"
                        />
                      )}
                    </span>
                    <span className="font-semibold text-vt-fg">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-vt-muted-2">{p.sku}</td>
                <td className="px-4 py-3 text-vt-muted-1">{p.category.name}</td>
                <td className="px-4 py-3 text-vt-muted-1">{p.brand.name}</td>
                <td className="px-4 py-3 text-vt-fg">{money(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={p.stock === 0 ? "font-bold text-vt-error" : "text-vt-fg"}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/productos/${p.id}/editar`} className="font-bold text-vt-accent">
                      Editar
                    </Link>
                    <DeleteProductButton productId={p.id} productName={p.name} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-vt-muted-2">
                  No hay productos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
