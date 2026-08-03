"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset, type RequestResetState } from "@/lib/password-reset-actions";
import { Icon, Spinner } from "@/components/Icon";

export function ForgotPasswordForm() {
  const [state, setState] = useState<RequestResetState>({});
  const [isPending, startTransition] = useTransition();

  if (state.done) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <Icon name="checkCircle" className="h-10 w-10 text-vt-accent" />
        <p className="text-[14.5px] text-vt-muted-1">
          Si ese correo está registrado, te acabamos de enviar un enlace para crear una contraseña
          nueva. Revisa también la carpeta de spam.
        </p>
        <Link href="/login" className="text-[13.5px] font-bold text-vt-accent hover:underline">
          ← Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form
      // Envío manual: con `<form action={...}>` React 19 reinicia el campo al
      // terminar, y un error de validación le borraría el correo ya escrito.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => setState(await requestPasswordReset({}, formData)));
      }}
      className="flex flex-col gap-5"
    >
      <div>
        <div className="mb-2 text-[13px] font-bold text-vt-fg">Correo electrónico</div>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-[10px] border border-white/10 bg-white/[.05] px-4 py-3 text-vt-fg"
        />
      </div>

      {state.error && <div className="text-[13px] text-vt-error">{state.error}</div>}

      <button
        type="submit"
        disabled={isPending}
        className="vt-btn vt-btn-accent flex items-center justify-center gap-2 rounded-[10px] bg-vt-accent py-3 text-[15px] font-extrabold text-vt-accent-fg disabled:opacity-60"
      >
        {isPending && <Spinner className="h-[18px] w-[18px]" />}
        {isPending ? "Enviando..." : "Enviar enlace"}
      </button>

      <Link href="/login" className="text-center text-[13px] font-semibold text-vt-muted-1 hover:text-vt-accent">
        ← Volver a iniciar sesión
      </Link>
    </form>
  );
}
