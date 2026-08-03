"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetPassword, type ResetPasswordState } from "@/lib/password-reset-actions";
import { Icon, Spinner } from "@/components/Icon";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, setState] = useState<ResetPasswordState>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (state.done) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <Icon name="checkCircle" className="h-10 w-10 text-vt-accent" />
        <p className="text-[14.5px] text-vt-muted-1">
          Tu contraseña se cambió correctamente. Ya puedes iniciar sesión con la nueva.
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="vt-btn vt-btn-accent rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-extrabold text-vt-accent-fg"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => setState(await resetPassword({}, formData)));
      }}
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="token" value={token} />

      <div>
        <div className="mb-2 text-[13px] font-bold text-vt-fg">Contraseña nueva</div>
        <input
          name="password"
          type="password"
          required
          minLength={6}
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
        {isPending ? "Guardando..." : "Guardar contraseña"}
      </button>
    </form>
  );
}
