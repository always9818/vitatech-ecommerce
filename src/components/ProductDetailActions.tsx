"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/lib/cart-actions";
import { useToast } from "@/components/ToastProvider";

export function ProductDetailActions({ productId, stock }: { productId: string; stock: number }) {
  const [qty, setQty] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const inStock = stock > 0;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center rounded-[10px] border border-white/10">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-4 py-3 text-lg font-bold text-vt-fg"
        >
          −
        </button>
        <div className="min-w-5 px-2 text-center font-bold text-vt-fg">{qty}</div>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(stock, q + 1))}
          className="px-4 py-3 text-lg font-bold text-vt-fg"
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={!inStock || isPending}
        onClick={() =>
          startTransition(async () => {
            await addToCart(productId, qty);
            showToast("✓ Agregado al carrito");
          })
        }
        className={
          inStock
            ? "flex-1 rounded-[10px] bg-vt-accent px-6 py-3.5 text-[15px] font-extrabold text-vt-accent-fg"
            : "flex-1 cursor-not-allowed rounded-[10px] bg-white/[.06] px-6 py-3.5 text-[15px] font-extrabold text-vt-muted-3"
        }
      >
        {inStock ? "Agregar al carrito" : "Agotado"}
      </button>
    </div>
  );
}
