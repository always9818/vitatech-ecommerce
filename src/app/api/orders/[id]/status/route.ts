import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Solo expone el estado (no items, dirección ni nada sensible), con el mismo
 * modelo de acceso que ya tiene /checkout/success?order=<id>: sin sesión,
 * protegido únicamente por lo impredecible del id (cuid). La usa
 * PendingPaymentPoller para saber cuándo dejar de mostrar "Procesando tu
 * pago…" sin que el cliente tenga que recargar la página a mano.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ status: order.status });
}
