"use client";

import { useTransition } from "react";
import { changeCartQty, removeCartItem } from "@/lib/cart-actions";
import { money } from "@/lib/money";

export function CartLine({
  productId,
  name,
  category,
  icon,
  price,
  quantity,
}: {
  productId: string;
  name: string;
  category: string;
  icon: string;
  price: number;
  quantity: number;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-white/10 py-5 last:border-none">
      <div className="grid h-[88px] w-[88px] flex-none place-items-center rounded-xl bg-white/[.05] text-4xl">
        {icon}
      </div>
      <div className="min-w-[160px] flex-1">
        <div className="text-[11px] font-bold tracking-[.06em] text-vt-accent uppercase">
          {category}
        </div>
        <div className="text-[13.5px] font-semibold text-vt-fg">{name}</div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => removeCartItem(productId))}
          className="mt-1 text-[12px] text-vt-error underline"
        >
          Eliminar
        </button>
      </div>
      <div className="flex items-center rounded-[10px] border border-white/10">
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => changeCartQty(productId, -1))}
          className="px-3 py-1.5 font-bold text-vt-fg"
        >
          −
        </button>
        <div className="min-w-5 px-1 text-center font-bold text-vt-fg">{quantity}</div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => changeCartQty(productId, 1))}
          className="px-3 py-1.5 font-bold text-vt-fg"
        >
          +
        </button>
      </div>
      <div className="font-heading flex-none text-lg font-bold text-white">
        {money(price * quantity)}
      </div>
    </div>
  );
}
