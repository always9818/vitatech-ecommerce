import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyRecurrenteWebhookSignature } from "@/lib/recurrente";
import { TAG_CATALOGO } from "@/lib/cache-tags";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email";

type UnknownRecord = Record<string, unknown>;

// El primer webhook real (2026-08-05) mostró las claves de verdad del
// payload — nada de "payment_intent.*" estilo Stripe, sino un evento con
// `event_type`, `checkout`, `payment`, `product(s)`, `installments`, etc.
// Mientras no se confirme el valor exacto de `event_type`, se hace match
// flexible por si trae mayúsculas o un nombre ligeramente distinto.
function extractEventType(event: UnknownRecord): string {
  const raw = event.event_type ?? event.type ?? (event.payment as UnknownRecord | undefined)?.status;
  return typeof raw === "string" ? raw : "";
}

function isPaidEvent(eventType: string) {
  return /succe|complet|\bpaid\b/i.test(eventType);
}

function isFailedEvent(eventType: string) {
  return /fail|declin|reject|cancel/i.test(eventType);
}

// Se prueban varias rutas plausibles para nuestro `metadata.orderId`: objeto
// plano, dentro de `checkout` (el objeto que nosotros mandamos al crear el
// checkout, que Recurrente parece devolver eco), dentro de `payment`, o
// envuelto en `data`/`data.object` (estilo Stripe, por si acaso).
function extractOrderId(event: UnknownRecord): string | null {
  const candidates: unknown[] = [
    event.metadata,
    (event.checkout as UnknownRecord | undefined)?.metadata,
    (event.payment as UnknownRecord | undefined)?.metadata,
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
  // Confirmado con el primer webhook real: Recurrente despacha via Svix, no
  // con un header propio — ver la nota en verifyRecurrenteWebhookSignature.
  const svixHeaders = {
    svixId: request.headers.get("svix-id"),
    svixTimestamp: request.headers.get("svix-timestamp"),
    svixSignature: request.headers.get("svix-signature"),
  };

  if (!verifyRecurrenteWebhookSignature(rawBody, svixHeaders)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as UnknownRecord;
  const eventType = extractEventType(event);
  const orderId = extractOrderId(event);

  if (!orderId) {
    // Dump completo mientras no se conozca la forma exacta del payload real:
    // en cuanto se confirme dónde vive `metadata.orderId`, se puede volver a
    // recortar este log (queda en wrangler tail, no en un lugar público).
    console.error("[recurrente webhook] No se encontró orderId. event_type=%s payload=%s", eventType, rawBody);
    return NextResponse.json({ received: true });
  }

  try {
    if (isPaidEvent(eventType)) {
      // Svix reintenta entregas fallidas solo, y también se puede reenviar a
      // mano desde su panel — sin este seguro, un mismo pago ya confirmado
      // volvería a descontar stock y a vaciar el carrito una segunda vez.
      const existing = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
      if (existing?.status === "PAID") {
        return NextResponse.json({ received: true, alreadyProcessed: true });
      }

      // `select` explícito (sin `couponId`) para que confirmar un pago siga
      // funcionando aunque el esquema de cupones todavía no esté aplicado en
      // la base; el cupón se consulta aparte, tolerando el fallo.
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
        select: {
          id: true,
          userId: true,
          guestId: true,
          guestEmail: true,
          total: true,
          // El correo del titular, para poder confirmarle la compra tambien a
          // quien SI tiene cuenta.
          user: { select: { email: true } },
          // Copia congelada de la direccion: va en el aviso a la tienda para
          // poder despachar sin abrir el panel. Todos opcionales en el
          // esquema, porque los pedidos viejos no la tienen.
          shipRecipientName: true,
          shipPhone: true,
          shipDepartment: true,
          shipMunicipality: true,
          shipAddressLine: true,
          shipZone: true,
          shipReference: true,
          items: { select: { productId: true, quantity: true, unitPrice: true, product: { select: { name: true } } } },
        },
      });

      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const lineas = order.items.map((it) => ({
        name: it.product.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      }));

      // El correo de confirmación va para TODOS, no solo invitados. Antes la
      // condición era `!order.userId && order.guestEmail`, con el argumento de
      // que quien tiene cuenta ya lo ve en "Mi cuenta" — pero eso lo obliga a
      // entrar a buscarlo, y lo único que le llegaba al buzón era el recibo de
      // Recurrente, con la marca de la pasarela y no la nuestra.
      //
      // Todo lo que sigue va en try/catch por la misma razón que el conteo del
      // cupón y la caché: que un correo falle nunca debe tumbar la
      // confirmación de un pago ya cobrado.
      const correoCliente = order.guestEmail ?? order.user?.email ?? null;
      if (correoCliente) {
        try {
          await sendOrderConfirmationEmail(
            correoCliente,
            { id: order.id, total: order.total, items: lineas },
            { tieneCuenta: Boolean(order.userId) }
          );
        } catch (err) {
          console.error("[recurrente webhook] No se pudo enviar la confirmación al cliente: %o", err);
        }
      }

      // Aviso a la tienda. Antes la única forma de enterarse de una venta era
      // entrar a /admin/pedidos: un pedido de domingo por la noche esperaba a
      // que alguien se acordara de revisar.
      try {
        // Los campos de envío son opcionales en el esquema (los pedidos
        // anteriores a esa función no los tienen), así que solo se arma el
        // bloque de dirección cuando están los que de verdad hacen falta.
        const envio =
          order.shipRecipientName &&
          order.shipPhone &&
          order.shipDepartment &&
          order.shipMunicipality &&
          order.shipAddressLine
            ? {
                recipientName: order.shipRecipientName,
                phone: order.shipPhone,
                department: order.shipDepartment,
                municipality: order.shipMunicipality,
                addressLine: order.shipAddressLine,
                zone: order.shipZone,
                reference: order.shipReference,
              }
            : null;

        await sendNewOrderAdminEmail({
          id: order.id,
          total: order.total,
          items: lineas,
          correoCliente,
          tieneCuenta: Boolean(order.userId),
          envio,
        });
      } catch (err) {
        console.error("[recurrente webhook] No se pudo avisar del pedido nuevo: %o", err);
      }

      // El stock que se acaba de descontar es el que la tienda muestra como
      // "Últimas 3" o "Agotado", y viene de la caché del catálogo. Sin esto,
      // una venta que deja algo en cero seguiría anunciándolo como disponible
      // hasta que la caché expirara sola. Vender de más no era posible (el
      // carrito y el checkout releen el stock real de la base), pero sí que un
      // cliente llegara ilusionado hasta el carrito para toparse ahí con el
      // "ya no tiene stock suficiente".
      //
      // Aquí no sirve `updateTag`: solo funciona dentro de un Server Action y
      // esto es un route handler. `{ expire: 0 }` pide el mismo efecto —
      // caducar ya, sin ventana de datos viejos — en vez del perfil "max", que
      // permitiría seguir sirviendo el stock anterior 5 minutos más y dejaría
      // esta llamada sin efecto práctico.
      //
      // Va en su propio try/catch por la misma razón que el conteo del cupón:
      // refrescar una caché nunca debe tumbar la confirmación de un pago.
      try {
        revalidateTag(TAG_CATALOGO, { expire: 0 });
      } catch (err) {
        console.error("[recurrente webhook] No se pudo refrescar la caché del catálogo: %o", err);
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

      // El carrito se busca por quien compró: con cuenta, por `userId`; sin
      // cuenta, por el `guestId` de su cookie que se guardó al crear el pedido.
      // Antes esto era `where: { userId: order.userId }` a secas, y con un
      // pedido de invitado (`userId` en null) Prisma habría reventado.
      const cart = order.userId
        ? await prisma.cart.findUnique({ where: { userId: order.userId }, select: { id: true } })
        : order.guestId
          ? await prisma.cart.findUnique({ where: { guestId: order.guestId }, select: { id: true } })
          : null;
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        await prisma.cart
          .update({ where: { id: cart.id }, data: { couponId: null } })
          .catch(() => {});
      }
    } else if (isFailedEvent(eventType)) {
      await prisma.order.update({ where: { id: orderId }, data: { status: "FAILED" } });
    } else {
      console.error("[recurrente webhook] Evento no reconocido como pagado ni fallido: %s", eventType);
    }
  } catch (err) {
    console.error("[recurrente webhook] Error procesando orderId=%s: %o", orderId, err);
  }

  return NextResponse.json({ received: true });
}
