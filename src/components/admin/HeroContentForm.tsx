"use client";

import { useActionState, useState, useTransition } from "react";
import {
  updateHeroContent,
  resetHeroContent,
  type HeroContentFormState,
} from "@/lib/admin-actions";
import { Spinner } from "@/components/Icon";
import type { HeroContent } from "@/lib/site-settings";

const inputClass =
  "w-full rounded-[10px] border border-white/10 bg-white/[.05] px-4 py-2.5 text-sm text-vt-fg placeholder:text-vt-muted-2 focus:border-vt-accent/50 focus:outline-none";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-vt-fg";
const hintClass = "mt-1 text-[11.5px] text-vt-muted-2";

export function HeroContentForm({ content }: { content: HeroContent }) {
  const [state, formAction, isPending] = useActionState<HeroContentFormState, FormData>(
    updateHeroContent,
    {}
  );
  const [isResetting, startResetTransition] = useTransition();

  // Copia local solo para la vista previa; lo que se guarda son los campos del
  // formulario, no este estado.
  const [draft, setDraft] = useState(content);
  const set = (campo: keyof HeroContent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft((d) => ({ ...d, [campo]: e.target.value }));

  return (
    <div className="rounded-2xl border border-white/10 p-6">
      <div className="mb-5">
        <div className="mb-2 text-[13px] font-semibold text-vt-muted-1">Vista previa</div>
        <div className="rounded-xl border border-white/10 bg-white/[.03] p-5">
          {draft.badge && (
            <span className="inline-flex items-center gap-2 rounded-full border border-vt-accent/30 bg-vt-accent/[.12] px-3.5 py-1.5 text-[12px] font-bold tracking-[.05em] text-vt-accent">
              {draft.badge}
            </span>
          )}
          <h2 className="font-heading my-3 text-[26px] leading-[1.1] font-bold text-white">
            {draft.title} {draft.titleAccent && <span className="text-vt-accent">{draft.titleAccent}</span>}
          </h2>
          {draft.subtitle && <p className="text-[13.5px] text-vt-muted-1">{draft.subtitle}</p>}
        </div>
      </div>

      <form action={formAction} className="grid grid-cols-1 gap-4">
        <div>
          <label className={labelClass}>Insignia</label>
          <input
            name="badge"
            defaultValue={content.badge}
            onChange={set("badge")}
            maxLength={60}
            placeholder="Ej. TEMPORADA TECH · HASTA -40%"
            className={inputClass}
          />
          <p className={hintClass}>
            La etiqueta verde de arriba. Déjala vacía para ocultarla.
          </p>
        </div>

        <div>
          <label className={labelClass}>Título</label>
          <input
            name="title"
            required
            defaultValue={content.title}
            onChange={set("title")}
            maxLength={70}
            placeholder="Ej. Potencia tu setup al mejor"
            className={inputClass}
          />
          <p className={hintClass}>El texto grande. No puede quedar vacío.</p>
        </div>

        <div>
          <label className={labelClass}>Palabra destacada</label>
          <input
            name="titleAccent"
            defaultValue={content.titleAccent}
            onChange={set("titleAccent")}
            maxLength={30}
            placeholder="Ej. precio"
            className={inputClass}
          />
          <p className={hintClass}>
            Se agrega al final del título, en verde. Déjala vacía si no quieres resaltar nada.
          </p>
        </div>

        <div>
          <label className={labelClass}>Párrafo</label>
          <textarea
            name="subtitle"
            rows={3}
            defaultValue={content.subtitle}
            onChange={set("subtitle")}
            maxLength={300}
            placeholder="Ej. Tecnología de las mejores marcas, con envío a todo Guatemala..."
            className={inputClass}
          />
          <p className={hintClass}>El texto pequeño bajo el título. Déjalo vacío para ocultarlo.</p>
        </div>

        {state.error && (
          <div className="rounded-lg border border-vt-error/30 bg-vt-error/10 px-4 py-3 text-[13px] text-vt-error">
            {state.error}
          </div>
        )}
        {state.ok && !isPending && (
          <div className="rounded-lg border border-vt-accent/30 bg-vt-accent/10 px-4 py-3 text-[13px] text-vt-accent">
            Textos actualizados. Ya se ven en la home.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="vt-btn vt-btn-accent flex items-center justify-center gap-2 rounded-[10px] bg-vt-accent px-6 py-2.5 text-sm font-extrabold text-vt-accent-fg disabled:opacity-50"
          >
            {isPending && <Spinner className="h-[18px] w-[18px]" />}
            {isPending ? "Guardando..." : "Guardar textos"}
          </button>
          <button
            type="button"
            disabled={isResetting}
            onClick={() => {
              if (!confirm("¿Restaurar los textos originales de la portada?")) return;
              startResetTransition(async () => {
                await resetHeroContent();
                location.reload();
              });
            }}
            className="text-[12.5px] font-bold text-vt-muted-1 hover:text-vt-fg disabled:opacity-50"
          >
            {isResetting ? "Restaurando..." : "Restaurar textos originales"}
          </button>
        </div>
      </form>
    </div>
  );
}
