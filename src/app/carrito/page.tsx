import Link from "next/link";
import { getCart } from "@/lib/cart-actions";
import { money } from "@/lib/money";
import { CartLine } from "@/components/CartLine";
import { CheckoutButton } from "@/components/CheckoutButton";

const FREE_SHIPPING_THRESHOLD = 299;
const SHIPPING_COST = 70;

export default async function CartPage() {
  const items = await getCart();
  const count = items.reduce((a, it) => a + it.quantity, 0);
  const subtotal = items.reduce((a, it) => a + it.product.price * it.quantity, 0);
  const listTotal = items.reduce((a, it) => a + it.product.oldPrice * it.quantity, 0);
  const discount = listTotal - subtotal;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  return (
    <div className="animate-vt-pop mx-auto max-w-[1180px] px-6 py-10">
      <div className="mb-6 font-heading text-[30px] font-bold text-white">
        Tu carrito{" "}
        <span className="text-[15px] font-semibold text-vt-muted-2">
          · {count} {count === 1 ? "producto" : "productos"}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 py-24 text-center">
          <span className="text-4xl">🛒</span>
          <div className="text-[17px] font-bold text-vt-fg">Tu carrito está vacío</div>
          <Link
            href="/catalogo"
            className="mt-2 rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-bold text-vt-accent-fg"
          >
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 min-[880px]:grid-cols-[1fr_340px]">
          <div className="rounded-2xl border border-white/10 px-5">
            {items.map((it) => (
              <CartLine
                key={it.id}
                productId={it.productId}
                name={it.product.name}
                category={it.product.category.name}
                icon={it.product.icon}
                price={it.product.price}
                quantity={it.quantity}
              />
            ))}
          </div>

          <div className="h-fit rounded-2xl border border-white/10 p-6 min-[880px]:sticky min-[880px]:top-24">
            <div className="flex justify-between text-[13.5px] text-vt-muted-1">
              <span>Precio de lista</span>
              <span className="line-through">{money(listTotal)}</span>
            </div>
            {discount > 0 && (
              <div className="mt-2.5 flex justify-between text-[13.5px] text-vt-muted-1">
                <span>Ahorras</span>
                <span className="font-bold text-vt-accent">− {money(discount)}</span>
              </div>
            )}
            <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-[13.5px] text-vt-muted-1">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="mt-2.5 flex justify-between text-[13.5px] text-vt-muted-1">
              <span>Envío</span>
              <span className="text-vt-accent">{shipping === 0 ? "Gratis" : money(shipping)}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                placeholder="Código de descuento"
                className="flex-1 rounded-lg border border-white/10 bg-white/[.05] px-3 py-2 text-[13px] text-vt-fg placeholder:text-vt-muted-2"
              />
              <button
                type="button"
                className="rounded-lg bg-vt-accent/[.15] px-4 text-[13px] font-bold text-vt-accent"
              >
                Aplicar
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
              <span className="text-[15px] font-semibold text-vt-fg">Total</span>
              <span className="font-heading text-[26px] font-bold text-vt-accent">{money(total)}</span>
            </div>

            <div className="mt-5">
              <CheckoutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
