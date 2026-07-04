import { notFound } from "next/navigation";
import { getProductById } from "@/lib/catalog";
import { money, discountPct } from "@/lib/money";
import { ProductDetailActions } from "@/components/ProductDetailActions";

const BENEFITS = [
  { icon: "🚚", label: "Envío gratis desde Q 299" },
  { icon: "🏪", label: "Recoge en tienda" },
  { icon: "🛡️", label: "Garantía 12 meses" },
  { icon: "↩️", label: "Devolución 15 días" },
];

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const off = discountPct(product.price, product.oldPrice);
  const stockLabel =
    product.stock === 0 ? "Agotado" : product.stock <= 5 ? `Últimas ${product.stock} unidades` : "En stock";
  const specs = (product.specs as { k: string; v: string }[]) ?? [];
  const cuota = "o " + money(Math.round(product.price / 6)) + "/mes en 6 cuotas sin intereses";

  return (
    <div className="animate-vt-slide mx-auto max-w-[1180px] px-6 py-10">
      <div className="grid grid-cols-1 gap-10 min-[880px]:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="grid h-[400px] place-items-center rounded-2xl bg-white/[.05] text-8xl">
            {product.icon}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="grid h-20 place-items-center rounded-xl bg-white/[.05] text-3xl"
              >
                {product.icon}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[12px] font-bold tracking-[.06em] text-vt-accent uppercase">
            {product.category.name} · {product.brand.name} · SKU {product.sku}
          </div>
          <h1 className="font-heading mt-2 mb-3 text-[30px] leading-[1.15] font-bold text-white">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 text-[13px] text-vt-muted-1">
            <span className="text-vt-accent">{"★".repeat(Math.round(product.rating))}</span>
            <span>{product.rating.toFixed(1)}</span>
            <span>· {product.reviews} reseñas</span>
            <span className="font-bold text-vt-accent">· {stockLabel}</span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <div className="font-heading text-[34px] font-bold text-white">{money(product.price)}</div>
            {off > 0 && (
              <>
                <div className="pb-1.5 text-[15px] text-vt-muted-2 line-through">
                  {money(product.oldPrice)}
                </div>
                <span className="mb-1 rounded-full bg-vt-accent px-2.5 py-1 text-[11px] font-bold text-vt-accent-fg">
                  -{off}%
                </span>
              </>
            )}
          </div>
          <div className="mt-1.5 text-[12.5px] text-vt-muted-2">{cuota}</div>

          <p className="mt-6 text-[14px] leading-relaxed text-vt-muted-1">{product.description}</p>

          <div className="mt-6">
            <ProductDetailActions productId={product.id} stock={product.stock} />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {BENEFITS.map((b) => (
              <div key={b.label} className="flex items-center gap-2.5 text-[12.5px] text-vt-muted-1">
                <span className="text-base">{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>

          <div className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10">
            {specs.map((s) => (
              <div key={s.k} className="flex justify-between px-4 py-3 text-[13px]">
                <span className="text-vt-muted-2">{s.k}</span>
                <span className="font-semibold text-vt-fg">{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
