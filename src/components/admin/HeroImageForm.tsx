"use client";

import { useActionState, useTransition } from "react";
import { updateHeroImage, removeHeroImage } from "@/lib/admin-actions";
import { Spinner } from "@/components/Icon";

export function HeroImageForm({ currentImage }: { currentImage?: string }) {
  const [state, formAction, isPending] = useActionState(updateHeroImage, {});
  const [isRemoving, startRemoveTransition] = useTransition();

  return (
    <div>
      {currentImage && (
        <div className="mb-4">
          <div className="mb-2 text-[13px] font-semibold text-vt-muted-1">Portada actual</div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.05]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentImage} alt="Portada actual" className="h-[220px] w-full object-cover" />
          </div>
          <button
            type="button"
            disabled={isRemoving}
            onClick={() => {
              if (!confirm("¿Quitar la imagen de portada? Se mostrará el ícono por defecto.")) return;
              startRemoveTransition(() => removeHeroImage());
            }}
            className="mt-2 text-[12.5px] font-bold text-vt-error disabled:opacity-50"
          >
            {isRemoving ? "Quitando..." : "Quitar portada"}
          </button>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <input
          name="image"
          type="file"
          required
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="w-full rounded-[10px] border border-white/10 bg-white/[.05] px-4 py-2.5 text-sm text-vt-fg"
        />
        <p className="text-[11.5px] text-vt-muted-2">
          JPG, PNG, WEBP o GIF, máximo 5 MB. Solo funciona en el sitio desplegado (no en desarrollo
          local).
        </p>
        {state.error && <div className="text-[12.5px] text-vt-error">{state.error}</div>}
        <button
          type="submit"
          disabled={isPending}
          className="vt-btn vt-btn-accent flex items-center justify-center gap-2 rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-extrabold text-vt-accent-fg"
        >
          {isPending && <Spinner className="h-[18px] w-[18px]" />}
          {isPending ? "Subiendo..." : currentImage ? "Reemplazar portada" : "Subir portada"}
        </button>
      </form>
    </div>
  );
}
