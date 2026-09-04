"use client";

import { useActionState } from "react";
import Link from "next/link";
import { confirmarCorreoAction, type ConfirmarState } from "@/lib/email-verification-actions";
import { Icon, Spinner } from "@/components/Icon";

export function VerifyForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState<ConfirmarState, FormData>(
    confirmarCorreoAction,
    {}
  );

  if (state.done) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <Icon name="checkCircle" className="h-10 w-10 text-vt-accent" />
        <p className="text-[14.5px] text-vt-muted-1">
          Tu correo quedó confirmado.
          {/* Solo se menciona cuando de verdad hubo algo que adoptar: decir
              "enlazamos 0 pedidos" no le sirve a nadie. */}
          {state.pedidosEnlazados
            ? ` Además encontramos ${state.pedidosEnlazados} ${
                state.pedidosEnlazados === 1 ? "pedido que hiciste" : "pedidos que hiciste"
              } sin cuenta con este correo, y ${
                state.pedidosEnlazados === 1 ? "ya aparece" : "ya aparecen"
              } en Mi cuenta.`
            : ""}
        </p>
        <Link
          href="/cuenta"
          className="vt-btn vt-btn-accent mt-2 rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-extrabold text-vt-accent-fg"
        >
          Ir a Mi cuenta
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      {state.error && <p className="text-[13.5px] text-vt-error">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="vt-btn vt-btn-accent flex items-center justify-center gap-2 rounded-[10px] bg-vt-accent px-6 py-3.5 text-[15px] font-extrabold text-vt-accent-fg"
      >
        {isPending ? <Spinner className="h-[18px] w-[18px]" /> : "Confirmar mi correo"}
      </button>
    </form>
  );
}
