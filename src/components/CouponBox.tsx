"use client";

import { useActionState, useTransition } from "react";
import { applyCoupon, removeCoupon, type CouponState } from "@/lib/coupon-actions";
import { Icon } from "@/components/Icon";

export function CouponBox({ appliedCode }: { appliedCode: string | null }) {
  const [state, formAction, isPending] = useActionState<CouponState, FormData>(applyCoupon, {});
  const [isRemoving, startRemoveTransition] = useTransition();

  if (appliedCode) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between rounded-lg border border-vt-accent/30 bg-vt-accent/10 px-3 py-2.5">
          <span className="flex items-center gap-2 text-[13px] font-bold text-vt-accent">
            <Icon name="checkCircle" className="h-4 w-4" />
            {appliedCode}
          </span>
          <button
            type="button"
            disabled={isRemoving}
            onClick={() => startRemoveTransition(() => removeCoupon())}
            className="text-[12.5px] font-bold text-vt-muted-1 hover:text-vt-error disabled:opacity-50"
          >
            Quitar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <form action={formAction} className="flex gap-2">
        <input
          name="code"
          placeholder="Código de descuento"
          className="flex-1 rounded-lg border border-white/10 bg-white/[.05] px-3 py-2 text-[13px] text-vt-fg placeholder:text-vt-muted-2 focus:border-vt-accent/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="vt-btn rounded-lg bg-vt-accent/[.15] px-4 text-[13px] font-bold text-vt-accent hover:bg-vt-accent/25 disabled:opacity-50"
        >
          {isPending ? "..." : "Aplicar"}
        </button>
      </form>
      {state.error && <div className="mt-1.5 text-[12px] text-vt-error">{state.error}</div>}
    </div>
  );
}
