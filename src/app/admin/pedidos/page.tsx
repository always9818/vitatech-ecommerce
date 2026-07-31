import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatOrderShipping } from "@/lib/shipping";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Pedidos · Panel VITATECH_" };

const STATUS: Record<string, { text: string; className: string }> = {
  PENDING: { text: "Pendiente de pago", className: "border-white/20 text-vt-muted-1" },
  PAID: { text: "Pagado", className: "border-vt-accent/40 text-vt-accent" },
  CANCELED: { text: "Cancelado", className: "border-white/15 text-vt-muted-2" },
  FAILED: { text: "Fallido", className: "border-vt-error/40 text-vt-error" },
};

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, sku: true } } } },
    },
  });

  const paidCount = orders.filter((o) => o.status === "PAID").length;
  const revenue = orders.filter((o) => o.status === "PAID").reduce((a, o) => a + o.total, 0);
  const q = (n: number) => `Q ${n.toLocaleString("es-GT")}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[24px] font-bold text-white">Pedidos</h1>
          <p className="mt-1 text-[13px] text-vt-muted-1">
            {orders.length} en total · {paidCount} pagados · {q(revenue)} vendidos
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 p-10 text-center">
          <Icon name="package" className="mx-auto h-8 w-8 text-vt-muted-2" />
          <div className="mt-3 text-[14px] font-semibold text-vt-fg">Todavía no hay pedidos</div>
          <p className="mt-1 text-[13px] text-vt-muted-1">
            Cuando un cliente complete una compra, aparecerá aquí con su dirección de entrega.
          </p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {orders.map((order) => {
            const status = STATUS[order.status] ?? {
              text: order.status,
              className: "border-white/20 text-vt-muted-1",
            };
            return (
              <li key={order.id} className="rounded-2xl border border-white/10 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[14.5px] font-bold text-vt-fg">
                      {order.user.name ?? "Sin nombre"}
                    </div>
                    <div className="text-[12.5px] text-vt-muted-2">{order.user.email}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`rounded-full border px-3 py-1 text-[11.5px] font-bold ${status.className}`}
                    >
                      {status.text}
                    </span>
                    <span className="text-[12px] text-vt-muted-2">
                      {order.createdAt.toLocaleString("es-GT", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-5 min-[760px]:grid-cols-2">
                  <div>
                    <div className="text-[12px] font-bold tracking-wide text-vt-muted-2 uppercase">
                      Productos
                    </div>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between gap-3 text-[13.5px]">
                          <span className="text-vt-muted-1">
                            {item.product.name}
                            <span className="text-vt-muted-2"> × {item.quantity}</span>
                          </span>
                          <span className="flex-none text-vt-fg">
                            {q(item.unitPrice * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-[12px] font-bold tracking-wide text-vt-muted-2 uppercase">
                      Entregar a
                    </div>
                    {order.shipAddressLine ? (
                      <div className="mt-2 flex flex-col gap-1 text-[13.5px] text-vt-muted-1">
                        <span className="font-semibold text-vt-fg">{order.shipRecipientName}</span>
                        <span>{order.shipPhone}</span>
                        <span>{formatOrderShipping(order)}</span>
                        {order.shipReference && (
                          <span className="text-vt-muted-2">Ref: {order.shipReference}</span>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-[13px] text-vt-muted-2">
                        Pedido anterior a la función de direcciones — contacta al cliente por correo
                        para confirmar a dónde enviarlo.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-4 border-t border-white/10 pt-3 text-[13px]">
                  <span className="text-vt-muted-2">
                    Envío {order.shipping === 0 ? "gratis" : q(order.shipping)}
                  </span>
                  {order.couponDiscount > 0 && (
                    <span className="text-vt-muted-2">Cupón −{q(order.couponDiscount)}</span>
                  )}
                  <span className="font-heading text-[18px] font-bold text-vt-accent">
                    {q(order.total)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
