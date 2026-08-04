"use client";

import { useState, useTransition } from "react";
import { addHeroSlide, deleteHeroSlide, moveHeroSlide } from "@/lib/hero-slide-actions";
import type { HeroSlideFormState } from "@/lib/hero-slide-actions";
import type { HeroSlideView } from "@/lib/hero-slides";
import { SlideLinkPicker, type DestinosDisponibles } from "@/components/admin/SlideLinkPicker";
import { Icon, Spinner } from "@/components/Icon";

const inputClass =
  "w-full rounded-[10px] border border-white/10 bg-white/[.05] px-4 py-2.5 text-sm text-vt-fg placeholder:text-vt-muted-2 focus:border-vt-accent/50 focus:outline-none";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-vt-fg";

export function HeroSlidesManager({
  slides,
  destinos,
}: {
  slides: HeroSlideView[];
  destinos: DestinosDisponibles;
}) {
  const [state, setState] = useState<HeroSlideFormState>({});
  const [isAdding, startAdd] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startAction] = useTransition();

  return (
    <div>
      <ol className="flex flex-col gap-3">
        {slides.map((slide, i) => (
          <li
            key={slide.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 p-4"
          >
            <div className="relative h-20 w-32 flex-none overflow-hidden rounded-lg bg-white/[.05]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt={slide.alt ?? ""}
                className="absolute inset-0 h-full w-full object-contain p-1"
              />
            </div>

            <div className="min-w-[220px] flex-1">
              <div className="text-[13.5px] font-bold text-vt-fg">Diseño {i + 1}</div>
              <div className="mt-1.5">
                <SlideLinkPicker slideId={slide.id} linkUrl={slide.linkUrl} destinos={destinos} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={i === 0 || busyId !== null}
                onClick={() => {
                  setBusyId(slide.id);
                  startAction(async () => {
                    await moveHeroSlide(slide.id, "up");
                    setBusyId(null);
                  });
                }}
                className="vt-btn-icon grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-vt-muted-1 hover:border-vt-accent hover:text-vt-accent disabled:opacity-30"
                aria-label={`Subir el diseño ${i + 1}`}
              >
                ↑
              </button>
              <button
                type="button"
                disabled={i === slides.length - 1 || busyId !== null}
                onClick={() => {
                  setBusyId(slide.id);
                  startAction(async () => {
                    await moveHeroSlide(slide.id, "down");
                    setBusyId(null);
                  });
                }}
                className="vt-btn-icon grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-vt-muted-1 hover:border-vt-accent hover:text-vt-accent disabled:opacity-30"
                aria-label={`Bajar el diseño ${i + 1}`}
              >
                ↓
              </button>
              <button
                type="button"
                disabled={busyId !== null}
                onClick={() => {
                  if (!confirm("¿Eliminar este diseño del carrusel?")) return;
                  setBusyId(slide.id);
                  startAction(async () => {
                    await deleteHeroSlide(slide.id);
                    setBusyId(null);
                  });
                }}
                className="text-[12.5px] font-bold text-vt-error disabled:opacity-40"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ol>

      {slides.length === 0 && (
        <p className="rounded-2xl border border-white/10 p-6 text-[13.5px] text-vt-muted-1">
          Todavía no hay diseños. Sube el primero abajo.
        </p>
      )}

      <form
        // Envío manual: con `<form action={...}>` React reinicia los campos al
        // terminar y se perdía el enlace ya escrito si la subida fallaba.
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          startAdd(async () => {
            const res = await addHeroSlide({}, formData);
            setState(res);
            if (res.ok) form.reset();
          });
        }}
        className="mt-8 flex max-w-xl flex-col gap-4 rounded-2xl border border-white/10 p-5"
      >
        <div className="text-[14px] font-bold text-vt-fg">Agregar un diseño</div>

        <div>
          <label className={labelClass}>Imagen</label>
          <input
            name="image"
            type="file"
            required
            accept="image/png,image/jpeg,image/webp,image/gif"
            className={inputClass}
          />
          <p className="mt-1 text-[11.5px] text-vt-muted-2">
            Máximo 5 MB. Se ve completa, sin recortes. Para que llene bien el espacio, diséñala
            apaisada (por ejemplo 1600 × 700 px).
          </p>
        </div>

        <div>
          <label className={labelClass}>
            A dónde lleva <span className="font-normal text-vt-muted-2">(opcional)</span>
          </label>
          <select name="linkUrl" defaultValue="" className={inputClass}>
            <option value="">Sin enlace (no se puede hacer clic)</option>
            <option value="/catalogo">Todo el catálogo</option>
            {destinos.productos.length > 0 && (
              <optgroup label="Ir a un producto">
                {destinos.productos.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.etiqueta}
                  </option>
                ))}
              </optgroup>
            )}
            {destinos.categorias.length > 0 && (
              <optgroup label="Ir a una categoría">
                {destinos.categorias.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.etiqueta}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <p className="mt-1 text-[11.5px] text-vt-muted-2">
            Si eliges un destino, la imagen se vuelve clicable y lleva ahí. También puedes cambiarlo
            después desde la lista de arriba.
          </p>
        </div>

        <div>
          <label className={labelClass}>
            Descripción <span className="font-normal text-vt-muted-2">(opcional)</span>
          </label>
          <input name="alt" placeholder="Promoción de laptops" className={inputClass} />
          <p className="mt-1 text-[11.5px] text-vt-muted-2">
            Se lee en voz alta para personas con discapacidad visual y aparece si la imagen no
            carga.
          </p>
        </div>

        {state.error && (
          <div className="rounded-lg border border-vt-error/30 bg-vt-error/10 px-4 py-3 text-[13px] text-vt-error">
            {state.error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isAdding}
            className="vt-btn vt-btn-accent flex items-center justify-center gap-2 rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-extrabold text-vt-accent-fg disabled:opacity-60"
          >
            {isAdding && <Spinner className="h-[18px] w-[18px]" />}
            {isAdding ? "Subiendo..." : "Agregar al carrusel"}
          </button>
          {state.ok && !isAdding && (
            <span className="vt-check-pop flex items-center gap-1.5 text-[13px] font-bold text-vt-accent">
              <Icon name="checkCircle" className="h-[18px] w-[18px]" />
              Agregado
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
