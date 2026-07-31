import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import { ReviewModerationActions } from "@/components/admin/ReviewModerationActions";

const STATUS_LABEL = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
} as const;

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-vt-accent">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          filled={i < rating}
          className={i < rating ? "h-3.5 w-3.5" : "h-3.5 w-3.5 text-vt-muted-3"}
        />
      ))}
    </span>
  );
}

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { user: { select: { name: true, email: true } }, product: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = reviews.filter((r) => r.status === "PENDING");
  const others = reviews.filter((r) => r.status !== "PENDING");

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Reseñas</h1>
      <p className="mt-2 text-[13.5px] text-vt-muted-1">
        Las reseñas quedan pendientes hasta que las apruebes; solo las aprobadas se muestran en la ficha
        del producto.
      </p>

      <h2 className="mt-8 font-heading text-lg font-bold text-white">
        Pendientes de aprobación{" "}
        <span className="text-[13px] font-semibold text-vt-muted-2">· {pending.length}</span>
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {pending.length === 0 && (
          <p className="text-[13px] text-vt-muted-2">No hay reseñas pendientes.</p>
        )}
        {pending.map((r) => (
          <div key={r.id} className="rounded-2xl border border-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-vt-fg">{r.user.name ?? r.user.email}</span>{" "}
                <span className="text-vt-muted-2">→ {r.product.name}</span>
              </div>
              <Stars rating={r.rating} />
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-vt-muted-1">{r.comment}</p>
            <div className="mt-3">
              <ReviewModerationActions reviewId={r.id} status={r.status} />
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-heading text-lg font-bold text-white">Historial</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/10 text-vt-muted-2">
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Calificación</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {others.map((r) => (
              <tr key={r.id} className="border-b border-white/5 last:border-none">
                <td className="px-4 py-3 text-vt-fg">{r.product.name}</td>
                <td className="px-4 py-3 text-vt-muted-1">{r.user.name ?? r.user.email}</td>
                <td className="px-4 py-3">
                  <Stars rating={r.rating} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.status === "APPROVED" ? "font-bold text-vt-accent" : "font-bold text-vt-muted-2"
                    }
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ReviewModerationActions reviewId={r.id} status={r.status} />
                </td>
              </tr>
            ))}
            {others.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-vt-muted-2">
                  Todavía no hay reseñas aprobadas o rechazadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
