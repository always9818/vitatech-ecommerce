import Link from "next/link";
import { money, discountPct } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Icon } from "@/components/Icon";
import { resolveProductIcon } from "@/lib/product-icon";

type CardProduct = {
  id: string;
  name: string;
  price: number;
  oldPrice: number;
  stock: number;
  icon: string;
  images: string[];
  category: { name: string };
};

export function ProductCard({ product, index = 0 }: { product: CardProduct; index?: number }) {
  const off = discountPct(product.price, product.oldPrice);
  const inStock = product.stock > 0;
  const stockBadge = product.stock === 0 ? "Agotado" : product.stock <= 5 ? `Últimas ${product.stock}` : null;
  const photo = product.images[0];

  return (
    <div
      className="animate-vt-stagger group rounded-2xl border border-white/10 bg-white/[.03] transition-all duration-200 hover:-translate-y-1.5 hover:border-vt-accent/50 hover:shadow-[0_18px_40px_rgba(0,0,0,.45)]"
      style={{ animationDelay: `${Math.min(index, 12) * 0.04}s` }}
    >
      <Link href={`/producto/${product.id}`} className="block">
        <div className="relative grid h-[170px] place-items-center overflow-hidden rounded-t-2xl bg-white/[.05] text-vt-muted-3">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-contain p-3"
              // Solo las primeras tarjetas (las que se ven sin hacer scroll) se
              // cargan de inmediato; el resto espera a acercarse a la vista. En
              // un catálogo de 20+ productos, sin esto el navegador bajaba todas
              // las fotos de una vez aunque el visitante nunca llegara a verlas.
              loading={index < 4 ? "eager" : "lazy"}
            />
          ) : (
            <Icon name={resolveProductIcon(product.icon, product.category.name)} className="h-14 w-14" />
          )}
          {off > 0 && (
            <span className="absolute top-2 left-2 rounded-full bg-vt-accent px-2 py-1 text-[11px] font-bold text-vt-accent-fg">
              -{off}%
            </span>
          )}
          {stockBadge && (
            <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[11px] font-bold text-vt-warning">
              {stockBadge}
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="text-[11px] font-bold tracking-[.06em] text-vt-accent uppercase">
          {product.category.name}
        </div>
        <Link href={`/producto/${product.id}`}>
          <div className="mt-1 line-clamp-2 min-h-[40px] text-[13.5px] font-semibold text-vt-fg">
            {product.name}
          </div>
        </Link>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="font-heading text-lg font-bold text-white">{money(product.price)}</div>
            {off > 0 && (
              <div className="text-[11.5px] text-vt-muted-2 line-through">{money(product.oldPrice)}</div>
            )}
          </div>
          <AddToCartButton
            productId={product.id}
            disabled={!inStock}
            stopPropagation
            trackingItem={{ id: product.id, name: product.name, price: product.price, category: product.category.name }}
            aria-label="Agregar al carrito"
            className={
              inStock
                ? "grid h-9 w-9 place-items-center rounded-full border border-vt-accent/40 text-vt-accent transition-colors hover:bg-vt-accent hover:text-vt-accent-fg"
                : "grid h-9 w-9 place-items-center rounded-full border border-white/10 text-vt-muted-3"
            }
          >
            <Icon name="plus" className="h-[18px] w-[18px]" />
          </AddToCartButton>
        </div>
      </div>
    </div>
  );
}
