"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart-actions";
import { GUEST_COOKIE } from "@/lib/cart-constants";
import { createRecurrenteCheckout, AVAILABLE_INSTALLMENTS } from "@/lib/recurrente";
import { getCartCoupon } from "@/lib/coupon-actions";
import { computeCouponDiscount } from "@/lib/coupon-utils";
import { readShippingInput, validateShipping, shippingCostFor } from "@/lib/shipping";
import { persistShippingProfile } from "@/lib/shipping-actions";


// Recurrente factura por línea de producto (amount_in_cents, sin soporte de
// descuentos negativos), así que el cupón se reparte proporcionalmente entre
// los precios unitarios que se le envían. El remanente de redondeo se ajusta
// en la última línea para que la suma cobrada cuadre exacto con `total`.
function applyDiscountToLineItems(
  items: { name: string; quantity: number; amountInCents: number; availableInstallments?: number[] }[],
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

/**
 * Identifica a quien compra. Con sesión es su `userId`; sin sesión, el correo
 * que escribió más el `vt_guest_id` de su cookie.
 *
 * El correo se exige solo a los invitados y NO es un capricho: sin cuenta, es
 * el único modo de contactarlos sobre su pedido.
 */
async function identificarComprador(
  formData: FormData
): Promise<{ userId: string | null; guestEmail: string | null; guestId: string | null } | { error: string }> {
  const session = await auth();
  if (session?.user) {
    return { userId: session.user.id, guestEmail: null, guestId: null };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return { error: "Escribe un correo válido: es a donde te avisamos sobre tu pedido." };
  }

  // Puede no existir si el carrito se armó antes de que la cookie se escribiera;
  // no es motivo para bloquear una venta, solo significa que el webhook no
  // podrá vaciarle el carrito solo.
  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE)?.value ?? null;

  return { userId: null, guestEmail: parsed.data, guestId };
}

export async function startCheckout(formData: FormData): Promise<{ url?: string; error?: string }> {
  const comprador = await identificarComprador(formData);
  if ("error" in comprador) return { error: comprador.error };

  const shipping_ = readShippingInput(formData);
  const shippingError = validateShipping(shipping_);
  if (shippingError) return { error: shippingError };

  // Guardar la dirección es secundario: si falla, la compra debe continuar.
  // Solo aplica a quien tiene cuenta — un invitado no tiene dónde guardarla.
  if (comprador.userId && formData.get("saveProfile") === "on") {
    try {
      await persistShippingProfile(comprador.userId, shipping_);
    } catch {
      /* no bloquea el checkout */
    }
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
  const shipping = shippingCostFor(subtotal);
  const coupon = await getCartCoupon();
  const couponDiscount = coupon ? computeCouponDiscount(coupon, subtotal) : 0;
  const total = Math.max(0, subtotal + shipping - couponDiscount);

  const order = await prisma.order.create({
    data: {
      userId: comprador.userId,
      guestEmail: comprador.guestEmail,
      guestId: comprador.guestId,
      subtotal,
      shipping,
      discount,
      // Solo se mencionan las columnas del cupón cuando de verdad hay uno: así
      // el checkout normal sigue funcionando aunque todavía no se haya corrido
      // `prisma db push` (esas columnas no existirían aún).
      ...(coupon ? { couponId: coupon.id, couponDiscount } : {}),
      total,
      shipRecipientName: shipping_.recipientName,
      shipPhone: shipping_.phone,
      shipDepartment: shipping_.department,
      shipMunicipality: shipping_.municipality,
      shipAddressLine: shipping_.addressLine,
      shipZone: shipping_.zone || null,
      shipReference: shipping_.reference || null,
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
        // Cuotas solo en los productos, no en el envío: no tiene sentido
        // financiar un cargo de Q25-70 a 12 meses.
        availableInstallments: AVAILABLE_INSTALLMENTS,
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
