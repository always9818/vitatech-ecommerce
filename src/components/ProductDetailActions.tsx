"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { addToCart } from "@/lib/cart-actions";
import { useToast } from "@/components/ToastProvider";
import { Icon, Spinner } from "@/components/Icon";
import { trackAddToCart, type TrackedItem } from "@/lib/tracking";

export function ProductDetailActions({
  productId,
  stock,
  trackingItem,
}: {
  productId: string;
  stock: number;
  trackingItem: Omit<TrackedItem, "quantity">;
}) {
  const [qty, setQty] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useToast();
  const inStock = stock > 0;

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center rounded-[10px] border border-white/10">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={qty <= 1}
          className="vt-btn vt-btn-icon grid place-items-center px-4 py-3.5 text-vt-fg hover:text-vt-accent"
          aria-label="Quitar una unidad"
        >
          <Icon name="minus" className="h-4 w-4" />
        </button>
        <div className="min-w-6 px-2 text-center font-bold text-vt-fg">{qty}</div>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(stock, q + 1))}
          disabled={qty >= stock}
          className="vt-btn vt-btn-icon grid place-items-center px-4 py-3.5 text-vt-fg hover:text-vt-accent"
          aria-label="Agregar una unidad"
        >
          <Icon name="plus" className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        disabled={!inStock || isPending}
        onClick={() =>
          startTransition(async () => {
            await addToCart(productId, qty);
            trackAddToCart({ ...trackingItem, quantity: qty });
            showToast("Agregado al carrito");
            setJustAdded(true);
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => setJustAdded(false), 1600);
          })
        }
        className={
          inStock
            ? "vt-btn vt-btn-accent flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-vt-accent px-6 py-3.5 text-[15px] font-extrabold text-vt-accent-fg"
            : "flex flex-1 cursor-not-allowed items-center justify-center rounded-[10px] bg-white/[.06] px-6 py-3.5 text-[15px] font-extrabold text-vt-muted-3"
        }
      >
        {!inStock ? (
          "Agotado"
        ) : isPending ? (
          <>
            <Spinner className="h-[18px] w-[18px]" />
            Agregando...
          </>
        ) : justAdded ? (
          <>
            <span className="animate-vt-check flex">
              <Icon name="check" className="h-[18px] w-[18px]" />
            </span>
            ¡Agregado!
          </>
        ) : (
          <>
            <Icon name="cart" className="h-[18px] w-[18px]" />
            Agregar al carrito
          </>
        )}
      </button>
    </div>
  );
}
