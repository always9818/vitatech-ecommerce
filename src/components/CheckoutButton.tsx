"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startCheckout } from "@/lib/checkout-actions";

export function CheckoutButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await startCheckout();
            if (result.error) {
              setError(result.error);
              return;
            }
            if (result.url) router.push(result.url);
          })
        }
        className="w-full rounded-[10px] bg-vt-accent py-3.5 text-[15px] font-extrabold text-vt-accent-fg disabled:opacity-60"
      >
        {isPending ? "Redirigiendo..." : "Finalizar compra"}
      </button>
      {error && <div className="mt-2 text-[12.5px] text-vt-error">{error}</div>}
    </div>
  );
}
