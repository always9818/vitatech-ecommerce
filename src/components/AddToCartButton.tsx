"use client";

import { useTransition } from "react";
import { addToCart } from "@/lib/cart-actions";
import { useToast } from "@/components/ToastProvider";

export function AddToCartButton({
  productId,
  quantity = 1,
  disabled,
  className,
  children,
  stopPropagation,
  "aria-label": ariaLabel,
}: {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  stopPropagation?: boolean;
  "aria-label"?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      className={className}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        startTransition(async () => {
          await addToCart(productId, quantity);
          showToast("✓ Agregado al carrito");
        });
      }}
    >
      {children}
    </button>
  );
}
