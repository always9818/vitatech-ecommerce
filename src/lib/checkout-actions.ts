"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart-actions";
import { createRecurrenteCheckout } from "@/lib/recurrente";
import { getCartCoupon } from "@/lib/coupon-actions";
import { computeCouponDiscount } from "@/lib/coupon-utils";

const FREE_SHIPPING_THRESHOLD = 299;
const SHIPPING_COST = 70;

// Recurrente factura por línea de producto (amount_in_cents, sin soporte de
// descuentos negativos), así que el cupón se reparte proporcionalmente entre
// los precios unitarios que se le envían. El remanente de redondeo se ajusta
// en la última línea para que la suma cobrada cuadre exacto con `total`.
function applyDiscountToLineItems(
  items: { name: string; quantity: number; amountInCents: number }[],
  discountInCents: number
) {
  if (discountInCents <= 0) return items;

  const grossTotal = items.reduce((a, it) => a + it.amountInCents * it.quantity, 0);
  if (grossTotal <= 0) return items;

  const ratio = discountInCents / grossTotal;
  const scaled = items.map((it) => ({
    ...it,
    amountInCents: Math.round(it.amountInCents * (1 - ratio)),
  }));

  const scaledTotal = scaled.reduce((a, it) => a + it.amountInCents * it.quantity, 0);
  const drift = grossTotal - discountInCents - scaledTotal;
  if (drift !== 0) {
    const last = scaled[scaled.length - 1];
    last.amountInCents += Math.round(drift / last.quantity);
  }

  return scaled;
}

export async function startCheckout(): Promise<{ url?: string; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Debes iniciar sesión para finalizar tu compra." };
  }

  const items = await getCart();
  if (items.length === 0) {
    return { error: "Tu carrito está vacío." };
  }

  for (const item of items) {
    if (item.quantity > item.product.stock) {
      return { error: `"${item.product.name}" ya no tiene stock suficiente.` };
    }
  }

  const subtotal = items.reduce((a, it) => a + it.product.price * it.quantity, 0);
  const listTotal = items.reduce((a, it) => a + it.product.oldPrice * it.quantity, 0);
  const discount = listTotal - subtotal;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const coupon = await getCartCoupon();
  const couponDiscount = coupon ? computeCouponDiscount(coupon, subtotal) : 0;
  const total = Math.max(0, subtotal + shipping - couponDiscount);

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      subtotal,
      shipping,
      discount,
      // Solo se mencionan las columnas del cupón cuando de verdad hay uno: así
      // el checkout normal sigue funcionando aunque todavía no se haya corrido
      // `prisma db push` (esas columnas no existirían aún).
      ...(coupon ? { couponId: coupon.id, couponDiscount } : {}),
      total,
      items: {
        create: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.product.price,
        })),
      },
    },
    select: { id: true },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const productItems = applyDiscountToLineItems(
      items.map((it) => ({
        name: it.product.name,
        quantity: it.quantity,
        amountInCents: it.product.price * 100,
      })),
      couponDiscount * 100
    );

    const checkout = await createRecurrenteCheckout({
      items: [
        ...productItems,
        ...(shipping > 0 ? [{ name: "Envío", quantity: 1, amountInCents: shipping * 100 }] : []),
      ],
      successUrl: `${appUrl}/checkout/success?order=${order.id}`,
      cancelUrl: `${appUrl}/checkout/cancel?order=${order.id}`,
      metadata: { orderId: order.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { recurrenteCheckoutId: checkout.id },
    });

    return { url: checkout.checkoutUrl };
  } catch (err) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { error: `No se pudo iniciar el pago con Recurrente: ${message}` };
  }
}
