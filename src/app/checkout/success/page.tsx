import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/money";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  if (!orderId) notFound();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) notFound();

  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-6 py-24 text-center">
      <span className="text-5xl">{order.status === "PAID" ? "✓" : "⏳"}</span>
      <div className="font-heading text-[26px] font-bold text-white">
        {order.status === "PAID" ? "¡Pedido confirmado!" : "Procesando tu pago…"}
      </div>
      <p className="text-[14px] text-vt-muted-1">
        Pedido <span className="font-semibold text-vt-fg">#{order.id.slice(-8)}</span> por{" "}
        <span className="font-semibold text-vt-accent">{money(order.total)}</span>.{" "}
        {order.status !== "PAID" &&
          "Recibirás una confirmación en cuanto Recurrente notifique el pago."}
      </p>
      <Link
        href="/catalogo"
        className="mt-2 rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-bold text-vt-accent-fg"
      >
        Seguir comprando
      </Link>
    </div>
  );
}
