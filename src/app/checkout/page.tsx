import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCart } from "@/lib/cart-actions";
import { getCartCoupon } from "@/lib/coupon-actions";
import { computeCouponDiscount } from "@/lib/coupon-utils";
import { getShippingProfile } from "@/lib/shipping-actions";
import { shippingCostFor } from "@/lib/shipping";
import { CheckoutForm } from "@/components/CheckoutForm";
import { InitiateCheckoutTracker } from "@/components/tracking/InitiateCheckoutTracker";

export const metadata = { title: "Datos de envío · VITATECH_" };

export default async function CheckoutPage() {
  // Ya NO se redirige a /login. Obligar a crear cuenta antes de pagar era la
  // principal fuga de ventas: el visitante nuevo tenía que registrarse y
  // esperar los ~5s de bcrypt solo para poder pagar. Ahora el invitado compra
  // dejando su correo, y se le ofrece iniciar sesión solo como atajo.
  const session = await auth();
  const esInvitado = !session?.user;

  const items = await getCart();
  if (items.length === 0) redirect("/carrito");

  const profile = await getShippingProfile();

  const subtotal = items.reduce((a, it) => a + it.product.price * it.quantity, 0);
  const shipping = shippingCostFor(subtotal);
  const coupon = await getCartCoupon();
  const couponDiscount = coupon ? computeCouponDiscount(coupon, subtotal) : 0;
  const total = Math.max(0, subtotal + shipping - couponDiscount);
  const q = (n: number) => `Q ${n.toLocaleString("es-GT")}`;

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-10">
      <InitiateCheckoutTracker
        items={items.map((it) => ({
          id: it.productId,
          name: it.product.name,
          price: it.product.price,
          quantity: it.quantity,
          category: it.product.category.name,
        }))}
        value={total}
      />
      <div className="text-[13px] text-vt-muted-2">
        <Link href="/carrito" className="hover:text-vt-accent">
          Carrito
        </Link>
        <span> › Datos de envío</span>
      </div>
      <h1 className="font-heading mt-2 text-[28px] font-bold text-white">Datos de envío</h1>
      <p className="mt-1 text-[13.5px] text-vt-muted-1">
        Dinos a dónde llevamos tu pedido. Después pasas al pago.
        {esInvitado && " No necesitas crear una cuenta."}
      </p>

      {esInvitado && (
        <p className="mt-3 text-[13px] text-vt-muted-2">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login?next=/checkout" className="font-semibold text-vt-accent hover:underline">
            Inicia sesión
          </Link>{" "}
          y se llenan solos tus datos de envío.
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-10 min-[900px]:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 p-6">
          <CheckoutForm
            defaults={profile ?? undefined}
            hasSavedProfile={Boolean(profile)}
            esInvitado={esInvitado}
          />
        </div>

        <aside className="h-fit rounded-2xl border border-white/10 p-6">
          <div className="font-heading text-[17px] font-bold text-white">Tu pedido</div>

          <ul className="mt-4 flex flex-col gap-3">
            {items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3 text-[13px]">
                <span className="text-vt-muted-1">
                  {it.product.name}
                  <span className="text-vt-muted-2"> × {it.quantity}</span>
                </span>
                <span className="flex-none font-semibold text-vt-fg">
                  {q(it.product.price * it.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 text-[13px]">
            <div className="flex justify-between">
              <span className="text-vt-muted-1">Subtotal</span>
              <span className="text-vt-fg">{q(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-vt-muted-1">Envío</span>
              <span className={shipping === 0 ? "font-semibold text-vt-accent" : "text-vt-fg"}>
                {shipping === 0 ? "Gratis" : q(shipping)}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-vt-muted-1">Cupón {coupon?.code}</span>
                <span className="font-semibold text-vt-accent">−{q(couponDiscount)}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-[14px] font-bold text-vt-fg">Total</span>
            <span className="font-heading text-[22px] font-bold text-vt-accent">{q(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
