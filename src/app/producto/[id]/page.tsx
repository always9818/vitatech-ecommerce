import { notFound } from "next/navigation";
import { getProductById } from "@/lib/catalog";
import { money, discountPct } from "@/lib/money";
import { ProductDetailActions } from "@/components/ProductDetailActions";
import { Icon, type IconName } from "@/components/Icon";
import { resolveProductIcon } from "@/lib/product-icon";

const BENEFITS: { icon: IconName; label: string }[] = [
  { icon: "truck", label: "Envío gratis desde Q 299" },
  { icon: "store", label: "Recoge en tienda" },
  { icon: "shield", label: "Garantía 12 meses" },
  { icon: "returns", label: "Devolución 15 días" },
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
  const fallbackIcon = resolveProductIcon(product.icon, product.category.name);
  const photos = product.images;
  const rating = Math.round(product.rating);

  return (
    <div className="animate-vt-slide mx-auto max-w-[1180px] px-6 py-10">
      <div className="grid grid-cols-1 gap-10 min-[880px]:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="grid h-[400px] place-items-center overflow-hidden rounded-2xl bg-white/[.05] text-vt-muted-3">
            {photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[0]} alt={product.name} className="h-full w-full object-contain p-6" />
            ) : (
              <Icon name={fallbackIcon} className="h-28 w-28" />
            )}
          </div>
          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {photos.slice(0, 4).map((src) => (
                <div className="grid h-20 place-items-center overflow-hidden rounded-xl bg-white/[.05]" key={src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={product.name} className="h-full w-full object-contain p-1.5" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-[12px] font-bold tracking-[.06em] text-vt-accent uppercase">
            {product.category.name} · {product.brand.name} · SKU {product.sku}
          </div>
          <h1 className="font-heading mt-2 mb-3 text-[30px] leading-[1.15] font-bold text-white">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 text-[13px] text-vt-muted-1">
            <span className="flex items-center gap-0.5 text-vt-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon
                  key={i}
                  name="star"
                  filled={i < rating}
                  className={i < rating ? "h-3.5 w-3.5" : "h-3.5 w-3.5 text-vt-muted-3"}
                />
              ))}
            </span>
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
                <span className="flex-none text-vt-accent">
                  <Icon name={b.icon} className="h-[18px] w-[18px]" />
                </span>
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
