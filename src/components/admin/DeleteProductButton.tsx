"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/lib/admin-actions";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`¿Eliminar "${productName}"? Esta acción no se puede deshacer.`)) return;
        startTransition(() => deleteProduct(productId));
      }}
      className="font-bold text-vt-error disabled:opacity-50"
    >
      {isPending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
