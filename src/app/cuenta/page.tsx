import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getShippingProfile } from "@/lib/shipping-actions";
import { formatOrderShipping } from "@/lib/shipping";
import { ShippingProfileForm } from "@/components/ShippingProfileForm";
import { VitoMascot } from "@/components/Logo";

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  PENDING: { text: "Pendiente de pago", className: "text-vt-muted-1" },
  PAID: { text: "Pagado", className: "text-vt-accent" },
  CANCELED: { text: "Cancelado", className: "text-vt-muted-2" },
  FAILED: { text: "Fallido", className: "text-vt-error" },
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [profile, orders] = await Promise.all([
    getShippingProfile(),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: { select: { name: true } } } } },
    }),
  ]);

  const q = (n: number) => `Q ${n.toLocaleString("es-GT")}`;

  return (
    <div className="mx-auto max-w-[760px] px-6 py-16">
      <div className="font-heading text-[28px] font-bold text-white">Mi cuenta</div>

      <div className="mt-4 rounded-2xl border border-white/10 p-6">
        <div className="text-[13px] text-vt-muted-2">Nombre</div>
        <div className="text-[15px] font-semibold text-vt-fg">{session.user.name ?? "—"}</div>
        <div className="mt-4 text-[13px] text-vt-muted-2">Correo</div>
        <div className="text-[15px] font-semibold text-vt-fg">{session.user.email}</div>
      </div>

      <section className="mt-8">
        <h2 className="font-heading text-[19px] font-bold text-white">Dirección de envío</h2>
        <p className="mt-1 text-[13px] text-vt-muted-1">
          Se completa sola al momento de comprar. Puedes cambiarla cuando quieras.
        </p>
        <div className="mt-4 rounded-2xl border border-white/10 p-6">
          <ShippingProfileForm defaults={profile ?? undefined} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-[19px] font-bold text-white">Mis pedidos</h2>

        {orders.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-white/10 p-10 text-center">
            <VitoMascot className="h-24 w-24" />
            <div className="text-[15px] font-bold text-vt-fg">Todavía no tienes pedidos</div>
            <Link href="/catalogo" className="text-[13.5px] font-semibold text-vt-accent hover:underline">
              Ver el catálogo →
            </Link>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {orders.map((order) => {
              const status = STATUS_LABEL[order.status] ?? {
                text: order.status,
                className: "text-vt-muted-1",
              };
              return (
                <li key={order.id} className="rounded-2xl border border-white/10 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[12.5px] text-vt-muted-2">
                      {order.createdAt.toLocaleDateString("es-GT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className={`text-[12.5px] font-bold ${status.className}`}>
                      {status.text}
                    </span>
                  </div>

                  <ul className="mt-3 flex flex-col gap-1.5">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-[13.5px] text-vt-muted-1">
                        {item.product.name}
                        <span className="text-vt-muted-2"> × {item.quantity}</span>
                      </li>
                    ))}
                  </ul>

                  {order.shipAddressLine && (
                    <div className="mt-3 text-[12.5px] text-vt-muted-2">
                      Envío a: {formatOrderShipping(order)}
                    </div>
                  )}

                  <div className="mt-3 border-t border-white/10 pt-3 text-right">
                    <span className="font-heading text-[17px] font-bold text-vt-accent">
                      {q(order.total)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {session.user.role === "ADMIN" && (
        <Link
          href="/admin/productos"
          className="mt-8 inline-block rounded-[10px] bg-vt-accent px-6 py-3 text-[13.5px] font-extrabold text-vt-accent-fg"
        >
          Panel de administración →
        </Link>
      )}

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-6"
      >
        <button
          type="submit"
          className="rounded-[10px] border border-white/[.14] px-6 py-3 text-[13.5px] font-semibold text-vt-fg hover:border-vt-accent hover:text-vt-accent"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
