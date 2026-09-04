"use client";

import { useState, useTransition } from "react";
import { reenviarVerificacion } from "@/lib/email-verification-actions";
import { Icon, Spinner } from "@/components/Icon";

/**
 * Aviso en Mi cuenta para quien todavía no confirmó su correo.
 *
 * Existe porque sin una forma de pedir otro enlace, perder el primero dejaba
 * al cliente atascado para siempre. Es informativo, no un bloqueo: puede
 * seguir comprando igual.
 */
export function VerificarCorreoAviso() {
  const [estado, setEstado] = useState<"inicial" | "enviado" | "error">("inicial");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-vt-warning/30 bg-vt-warning/[.06] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Icon name="clock" className="mt-0.5 h-5 w-5 flex-none text-vt-warning" />
        <div>
          <div className="text-[14.5px] font-semibold text-vt-fg">Confirma tu correo</div>
          <p className="mt-0.5 text-[13.5px] text-vt-muted-1">
            {estado === "enviado"
              ? "Listo, te mandamos un enlace nuevo. Revisa tu bandeja (y la carpeta de spam)."
              : estado === "error"
                ? "No pudimos enviar el correo. Intenta de nuevo en un momento."
                : "Te mandamos un enlace cuando creaste la cuenta. Confirmarlo nos asegura que te lleguen los avisos de tus pedidos."}
          </p>
        </div>
      </div>

      {estado !== "enviado" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const r = await reenviarVerificacion();
              setEstado(r.ok ? "enviado" : "error");
            })
          }
          className="vt-btn flex flex-none items-center justify-center gap-2 rounded-[10px] border border-vt-warning/40 px-4 py-2.5 text-[13.5px] font-bold text-vt-warning"
        >
          {isPending ? <Spinner className="h-4 w-4" /> : "Reenviar enlace"}
        </button>
      )}
    </div>
  );
}
