import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRecurrenteWebhookSignature } from "@/lib/recurrente";

// Ajustar el nombre exacto del header de firma contra el payload real que
// llegue del primer webhook (Recurrente no publica el header exacto en su
// documentación pública). Ver logs de Cloudflare (wrangler tail) si falla.
const SIGNATURE_HEADER = "x-recurrente-signature";

const PAID_EVENTS = new Set(["payment_intent.succeeded"]);
const FAILED_EVENTS = new Set(["payment_intent.failed"]);

type UnknownRecord = Record<string, unknown>;

// El esquema de Recurrente sigue el patrón de Stripe (payment_intent.*), pero
// no hay documentación pública de dónde queda anidado nuestro `metadata`.
// Se prueban varias rutas plausibles: objeto plano, envuelto en `data`,
// o envuelto en `data.object` (estilo Stripe).
function extractOrderId(event: UnknownRecord): string | null {
  const candidates: unknown[] = [
    event.metadata,
    (event.data as UnknownRecord | undefined)?.metadata,
    ((event.data as UnknownRecord | undefined)?.object as UnknownRecord | undefined)?.metadata,
    (event.object as UnknownRecord | undefined)?.metadata,
  ];

  for (const candidate of candidates) {
    const orderId = (candidate as UnknownRecord | undefined)?.orderId;
    if (typeof orderId === "string" && orderId.length > 0) return orderId;
  }
  return null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER);

  if (!verifyRecurrenteWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as UnknownRecord & { type?: string };
  const eventType = event.type ?? "";
  const orderId = extractOrderId(event);

  if (!orderId) {
    console.error(
      "[recurrente webhook] No se encontró orderId en el payload. type=%s keys=%s",
      eventType,
      Object.keys(event).join(",")
    );
    return NextResponse.json({ received: true });
  }

  try {
    if (PAID_EVENTS.has(eventType)) {
      // `select` explícito (sin `couponId`) para que confirmar un pago siga
      // funcionando aunque el esquema de cupones todavía no esté aplicado en
      // la base; el cupón se consulta aparte, tolerando el fallo.
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
        select: { id: true, userId: true, items: true },
      });

      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      try {
        const withCoupon = await prisma.order.findUnique({
          where: { id: order.id },
          select: { couponId: true },
        });
        if (withCoupon?.couponId) {
          await prisma.coupon.update({
            where: { id: withCoupon.couponId },
            data: { usageCount: { increment: 1 } },
          });
        }
      } catch (err) {
        console.error("[recurrente webhook] No se pudo contabilizar el cupón: %o", err);
      }

      const cart = await prisma.cart.findUnique({
        where: { userId: order.userId },
        select: { id: true },
      });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        await prisma.cart
          .update({ where: { id: cart.id }, data: { couponId: null } })
          .catch(() => {});
      }
    } else if (FAILED_EVENTS.has(eventType)) {
      await prisma.order.update({ where: { id: orderId }, data: { status: "FAILED" } });
    } else {
      console.error("[recurrente webhook] Evento no manejado: %s", eventType);
    }
  } catch (err) {
    console.error("[recurrente webhook] Error procesando orderId=%s: %o", orderId, err);
  }

  return NextResponse.json({ received: true });
}
