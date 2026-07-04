"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart-actions";
import { createRecurrenteCheckout } from "@/lib/recurrente";

const FREE_SHIPPING_THRESHOLD = 299;
const SHIPPING_COST = 70;

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
  const total = subtotal + shipping;

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      subtotal,
      shipping,
      discount,
      total,
      items: {
        create: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.product.price,
        })),
      },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const checkout = await createRecurrenteCheckout({
      items: [
        ...items.map((it) => ({
          name: it.product.name,
          quantity: it.quantity,
          amountInCents: it.product.price * 100,
        })),
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
