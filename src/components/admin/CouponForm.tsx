"use client";

import { useActionState } from "react";
import { createCoupon, type CouponFormState } from "@/lib/admin-actions";

const inputClass =
  "w-full rounded-[10px] border border-white/10 bg-white/[.05] px-4 py-2.5 text-sm text-vt-fg placeholder:text-vt-muted-2 focus:border-vt-accent/50 focus:outline-none";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-vt-fg";

export function CouponForm() {
  const [state, formAction, isPending] = useActionState<CouponFormState, FormData>(createCoupon, {});

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 p-6 min-[880px]:grid-cols-2"
    >
      <div>
        <label className={labelClass}>Código</label>
        <input
          name="code"
          required
          placeholder="Ej. VITATECH10"
          className={`${inputClass} uppercase`}
          style={{ textTransform: "uppercase" }}
        />
      </div>

      <div>
        <label className={labelClass}>Tipo</label>
        <select name="type" defaultValue="PERCENT" className={inputClass}>
          <option value="PERCENT">Porcentaje (%)</option>
          <option value="FIXED">Monto fijo (Q)</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Valor</label>
        <input
          name="value"
          type="number"
          min="1"
          step="1"
          required
          placeholder="Ej. 10"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Límite de usos (opcional)</label>
        <input name="usageLimit" type="number" min="1" step="1" placeholder="Sin límite" className={inputClass} />
      </div>

      <div className="min-[880px]:col-span-2">
        <label className={labelClass}>Fecha de expiración (opcional)</label>
        <input name="expiresAt" type="date" className={inputClass} />
      </div>

      {state.error && (
        <div className="min-[880px]:col-span-2 rounded-lg border border-vt-error/30 bg-vt-error/10 px-4 py-3 text-[13px] text-vt-error">
          {state.error}
        </div>
      )}

      <div className="min-[880px]:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="vt-btn vt-btn-accent rounded-[10px] bg-vt-accent px-6 py-2.5 text-sm font-extrabold text-vt-accent-fg"
        >
          {isPending ? "Creando..." : "Crear cupón"}
        </button>
      </div>
    </form>
  );
}
