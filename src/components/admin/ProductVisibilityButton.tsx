"use client";

import { useTransition } from "react";
import { toggleProductVisibility } from "@/lib/admin-actions";

export function ProductVisibilityButton({
  productId,
  visible,
}: {
  productId: string;
  visible: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleProductVisibility(productId, !visible))}
      title={
        visible
          ? "Deja de mostrarse en la tienda, pero se conserva en tus pedidos"
          : "Vuelve a mostrarse a los clientes"
      }
      className="font-bold text-vt-muted-1 hover:text-vt-accent disabled:opacity-50"
    >
      {isPending ? "..." : visible ? "Ocultar" : "Mostrar"}
    </button>
  );
}
