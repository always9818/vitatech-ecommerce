import Link from "next/link";
import { getCart } from "@/lib/cart-actions";
import { money } from "@/lib/money";
import { CartLine } from "@/components/CartLine";
import { CheckoutButton } from "@/components/CheckoutButton";
import { CouponBox } from "@/components/CouponBox";
import { getCartCoupon } from "@/lib/coupon-actions";
import { computeCouponDiscount } from "@/lib/coupon-utils";
import { VitoMascot } from "@/components/Logo";
import { shippingCostFor } from "@/lib/shipping";
import { FreeShippingBar } from "@/components/FreeShippingBar";

export default async function CartPage() {
  const items = await getCart();
  const count = items.reduce((a, it) => a + it.quantity, 0);
  const subtotal = items.reduce((a, it) => a + it.product.price * it.quantity, 0);
  const listTotal = items.reduce((a, it) => a + it.product.oldPrice * it.quantity, 0);
  const discount = listTotal - subtotal;
  const shipping = subtotal === 0 ? 0 : shippingCostFor(subtotal);
  const coupon = await getCartCoupon();
  const couponDiscount = coupon ? computeCouponDiscount(coupon, subtotal) : 0;
  const total = Math.max(0, subtotal + shipping - couponDiscount);

  return (
    <div className="animate-vt-pop mx-auto max-w-[1180px] px-6 py-10">
      <div className="mb-6 font-heading text-[30px] font-bold text-white">
        Tu carrito{" "}
        <span className="text-[15px] font-semibold text-vt-muted-2">
          · {count} {count === 1 ? "producto" : "productos"}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 py-20 text-center">
          <VitoMascot className="h-28 w-28" />
          <div className="text-[17px] font-bold text-vt-fg">Tu carrito está vacío</div>
          <p className="max-w-[320px] text-[13.5px] text-vt-muted-1">
            Vito no encontró nada aquí todavía. Date una vuelta por el catálogo.
          </p>
          <Link
            href="/catalogo"
            className="vt-btn vt-btn-accent mt-2 rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-bold text-vt-accent-fg"
          >
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 min-[880px]:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-5">
            <FreeShippingBar subtotal={subtotal} />
            <div className="rounded-2xl border border-white/10 px-5">
              {items.map((it) => (
                <CartLine
                  key={it.id}
                  productId={it.productId}
                  name={it.product.name}
                  category={it.product.category.name}
                  icon={it.product.icon}
                  photo={it.product.images[0]}
                  price={it.product.price}
                  quantity={it.quantity}
                />
              ))}
            </div>
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
            {couponDiscount > 0 && (
              <div className="mt-2.5 flex justify-between text-[13.5px] text-vt-muted-1">
                <span>Cupón {coupon?.code}</span>
                <span className="font-bold text-vt-accent">− {money(couponDiscount)}</span>
              </div>
            )}

            <CouponBox appliedCode={coupon?.code ?? null} />

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
