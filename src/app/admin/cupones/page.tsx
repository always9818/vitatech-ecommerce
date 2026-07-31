import { prisma } from "@/lib/prisma";
import { money } from "@/lib/money";
import { CouponForm } from "@/components/admin/CouponForm";
import { CouponToggleButton } from "@/components/admin/CouponToggleButton";

function isExpired(expiresAt: Date | null) {
  return !!expiresAt && expiresAt.getTime() < Date.now();
}

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Cupones</h1>
      <p className="mt-2 text-[13.5px] text-vt-muted-1">
        Los clientes los aplican en el carrito con el campo &quot;Código de descuento&quot;.
      </p>

      <div className="mt-6">
        <CouponForm />
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/10 text-vt-muted-2">
              <th className="px-4 py-3 font-semibold">Código</th>
              <th className="px-4 py-3 font-semibold">Descuento</th>
              <th className="px-4 py-3 font-semibold">Usos</th>
              <th className="px-4 py-3 font-semibold">Expira</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const expired = isExpired(c.expiresAt);
              const exhausted = c.usageLimit !== null && c.usageCount >= c.usageLimit;
              const effectivelyActive = c.active && !expired && !exhausted;
              return (
                <tr key={c.id} className="border-b border-white/5 last:border-none">
                  <td className="px-4 py-3 font-bold text-vt-fg">{c.code}</td>
                  <td className="px-4 py-3 text-vt-muted-1">
                    {c.type === "PERCENT" ? `${c.value}%` : money(c.value)}
                  </td>
                  <td className="px-4 py-3 text-vt-muted-1">
                    {c.usageCount}
                    {c.usageLimit !== null ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-vt-muted-1">
                    {c.expiresAt
                      ? c.expiresAt.toLocaleDateString("es-GT", { year: "numeric", month: "short", day: "numeric" })
                      : "Sin expiración"}
                  </td>
                  <td className="px-4 py-3">
                    {effectivelyActive ? (
                      <span className="font-bold text-vt-accent">Activo</span>
                    ) : (
                      <span className="font-bold text-vt-muted-2">
                        {!c.active ? "Desactivado" : expired ? "Expirado" : "Agotado"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <CouponToggleButton couponId={c.id} active={c.active} />
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-vt-muted-2">
                  Todavía no hay cupones creados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
