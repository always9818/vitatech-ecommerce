"use client";

import { useActionState } from "react";
import { saveShippingProfile, type ShippingFormState } from "@/lib/shipping-actions";
import { ShippingFields, type ShippingDefaults } from "@/components/ShippingFields";
import { Icon, Spinner } from "@/components/Icon";

export function ShippingProfileForm({ defaults }: { defaults?: ShippingDefaults }) {
  const [state, formAction, isPending] = useActionState<ShippingFormState, FormData>(
    saveShippingProfile,
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Se prefiere lo último enviado sobre lo guardado: si la validación
          falló, el cliente recupera lo que había escrito en vez de empezar
          de cero (React reinicia los campos tras ejecutar la acción). */}
      <ShippingFields defaults={state.values ?? defaults} />

      {state.error && (
        <div className="rounded-lg border border-vt-error/30 bg-vt-error/10 px-4 py-3 text-[13px] text-vt-error">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="vt-btn vt-btn-accent flex items-center justify-center gap-2 rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-extrabold text-vt-accent-fg disabled:opacity-60"
        >
          {isPending && <Spinner className="h-[18px] w-[18px]" />}
          {isPending ? "Guardando..." : "Guardar dirección"}
        </button>

        {state.ok && !isPending && (
          <span className="vt-check-pop flex items-center gap-1.5 text-[13px] font-bold text-vt-accent">
            <Icon name="checkCircle" className="h-[18px] w-[18px]" />
            Guardada
          </span>
        )}
      </div>
    </form>
  );
}
