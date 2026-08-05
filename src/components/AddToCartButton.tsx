"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { addToCart } from "@/lib/cart-actions";
import { useToast } from "@/components/ToastProvider";
import { Icon, Spinner } from "@/components/Icon";
import { trackAddToCart, type TrackedItem } from "@/lib/tracking";

export function AddToCartButton({
  productId,
  quantity = 1,
  disabled,
  className,
  children,
  stopPropagation,
  trackingItem,
  "aria-label": ariaLabel,
}: {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  stopPropagation?: boolean;
  trackingItem: Omit<TrackedItem, "quantity">;
  "aria-label"?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useToast();

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      className={`vt-btn vt-btn-icon ${className ?? ""}`}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        startTransition(async () => {
          await addToCart(productId, quantity);
          trackAddToCart({ ...trackingItem, quantity });
          showToast("Agregado al carrito");
          setJustAdded(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setJustAdded(false), 1300);
        });
      }}
    >
      {isPending ? (
        <Spinner className="h-[18px] w-[18px]" />
      ) : justAdded ? (
        <span className="animate-vt-check">
          <Icon name="check" className="h-[18px] w-[18px]" />
        </span>
      ) : (
        children
      )}
    </button>
  );
}
