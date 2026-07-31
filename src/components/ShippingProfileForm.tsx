"use client";

import { useState, useTransition } from "react";
import { saveShippingProfile, type ShippingFormState } from "@/lib/shipping-actions";
import { ShippingFields, type ShippingDefaults } from "@/components/ShippingFields";
import { Icon, Spinner } from "@/components/Icon";

export function ShippingProfileForm({ defaults }: { defaults?: ShippingDefaults }) {
  const [state, setState] = useState<ShippingFormState>({});
  const [isPending, startTransition] = useTransition();

  return (
    <form
      // Envío manual en vez de `<form action={...}>`: React 19 reinicia los
      // campos no controlados al terminar una acción de formulario, y eso le
      // borraba al cliente todo lo que había escrito cuando la validación
      // fallaba. Peor aún en el <select>, que al reiniciarse saltaba a la
      // primera opción válida y cambiaba el departamento en silencio.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          setState(await saveShippingProfile({}, formData));
        });
      }}
      className="flex flex-col gap-6"
    >
      <ShippingFields defaults={defaults} />

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
