"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startCheckout } from "@/lib/checkout-actions";
import { Icon, Spinner } from "@/components/Icon";
import { ShippingFields, type ShippingDefaults } from "@/components/ShippingFields";

export function CheckoutForm({
  defaults,
  hasSavedProfile,
}: {
  defaults?: ShippingDefaults;
  hasSavedProfile: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          setError(null);
          const result = await startCheckout(formData);
          if (result.error) {
            setError(result.error);
            return;
          }
          if (result.url) router.push(result.url);
        });
      }}
      className="flex flex-col gap-6"
    >
      <ShippingFields defaults={defaults} />

      <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-vt-muted-1">
        <input
          type="checkbox"
          name="saveProfile"
          defaultChecked={!hasSavedProfile}
          className="h-4 w-4 accent-vt-accent"
        />
        Guardar esta dirección para mis próximas compras
      </label>

      {error && (
        <div className="rounded-lg border border-vt-error/30 bg-vt-error/10 px-4 py-3 text-[13px] text-vt-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="vt-btn vt-btn-accent flex w-full items-center justify-center gap-2 rounded-[10px] bg-vt-accent py-3.5 text-[15px] font-extrabold text-vt-accent-fg disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Spinner className="h-[18px] w-[18px]" />
            Redirigiendo al pago...
          </>
        ) : (
          <>
            <Icon name="card" className="h-[18px] w-[18px]" />
            Continuar al pago
          </>
        )}
      </button>

      <p className="text-center text-[12px] text-vt-muted-2">
        El pago se procesa de forma segura en Recurrente. No guardamos los datos de tu tarjeta.
      </p>
    </form>
  );
}
