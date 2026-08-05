import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/money";
import { Icon } from "@/components/Icon";
import { PurchaseTracker } from "@/components/tracking/PurchaseTracker";
import { PendingPaymentPoller } from "@/components/PendingPaymentPoller";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  if (!orderId) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { include: { category: true } } } } },
  });
  if (!order) notFound();

  const isPaid = order.status === "PAID";
  const isFailed = order.status === "FAILED";

  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-6 py-24 text-center">
      {/* Nunca antes de que Recurrente confirme el pago: si se disparara en
          PENDING, un pedido que termina fallando igual contaría como venta. */}
      {isPaid && (
        <PurchaseTracker
          orderId={order.id}
          value={order.total}
          items={order.items.map((it) => ({
            id: it.productId,
            name: it.product.name,
            price: it.unitPrice,
            quantity: it.quantity,
            category: it.product.category.name,
          }))}
        />
      )}
      {!isPaid && !isFailed && <PendingPaymentPoller orderId={order.id} status={order.status} />}

      <span className={isPaid ? "text-vt-accent" : isFailed ? "text-vt-error" : "text-vt-warning"}>
        <Icon name={isPaid ? "checkCircle" : isFailed ? "xCircle" : "clock"} className="h-14 w-14" />
      </span>
      <div className="font-heading text-[26px] font-bold text-white">
        {isPaid ? "¡Pedido confirmado!" : isFailed ? "No se pudo procesar el pago" : "Procesando tu pago…"}
      </div>
      <p className="text-[14px] text-vt-muted-1">
        Pedido <span className="font-semibold text-vt-fg">#{order.id.slice(-8)}</span> por{" "}
        <span className="font-semibold text-vt-accent">{money(order.total)}</span>.{" "}
        {!isPaid &&
          !isFailed &&
          "Esta pantalla se actualiza sola en cuanto Recurrente confirme el pago."}
        {isFailed && "No se te realizó ningún cargo. Escríbenos por WhatsApp si el problema sigue."}
      </p>
      <Link
        href={isFailed ? "/carrito" : "/catalogo"}
        className="vt-btn vt-btn-accent mt-2 rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-bold text-vt-accent-fg"
      >
        {isFailed ? "Volver al carrito" : "Seguir comprando"}
      </Link>
    </div>
  );
}
