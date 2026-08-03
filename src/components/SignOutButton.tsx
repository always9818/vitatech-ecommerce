"use client";

import { useTransition } from "react";
import { signOutAction } from "@/lib/auth-actions";
import { Spinner } from "@/components/Icon";

/**
 * Era un `<form>` dentro de un componente de servidor, así que no podía mostrar
 * nada mientras trabajaba: al hacer clic la pantalla se quedaba igual durante
 * todo el viaje al servidor más la carga de la home, y parecía trabada. Es el
 * único botón del sitio que no daba señal de estar haciendo algo.
 */
export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => signOutAction())}
      className="vt-btn flex items-center justify-center gap-2 rounded-[10px] border border-white/[.14] px-6 py-3 text-[13.5px] font-semibold text-vt-fg hover:border-vt-accent hover:text-vt-accent disabled:opacity-60"
    >
      {isPending && <Spinner className="h-[18px] w-[18px]" />}
      {isPending ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}
