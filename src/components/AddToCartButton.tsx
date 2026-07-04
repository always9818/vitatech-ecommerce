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
}: {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  stopPropagation?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      className={className}
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
