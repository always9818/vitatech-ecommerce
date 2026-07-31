"use client";

import { useTransition } from "react";
import { toggleCoupon } from "@/lib/admin-actions";

export function CouponToggleButton({ couponId, active }: { couponId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleCoupon(couponId, !active))}
      className={`font-bold disabled:opacity-50 ${active ? "text-vt-error" : "text-vt-accent"}`}
    >
      {active ? "Desactivar" : "Activar"}
    </button>
  );
}
