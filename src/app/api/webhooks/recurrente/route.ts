import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRecurrenteWebhookSignature } from "@/lib/recurrente";

// Ajustar el nombre exacto del header de firma y la forma del payload
// contra https://docs.recurrente.com antes de producción.
const SIGNATURE_HEADER = "x-recurrente-signature";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER);

  if (!verifyRecurrenteWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    type: string;
    data: { checkout_id?: string; metadata?: { orderId?: string } };
  };

  const orderId = event.data?.metadata?.orderId;
  if (!orderId) {
    return NextResponse.json({ received: true });
  }

  if (event.type === "payment.completed" || event.type === "checkout.completed") {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
      include: { items: true, user: true },
    });

    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  } else if (event.type === "payment.failed") {
    await prisma.order.update({ where: { id: orderId }, data: { status: "FAILED" } });
  }

  return NextResponse.json({ received: true });
}
