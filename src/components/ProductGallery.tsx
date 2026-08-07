"use client";

import { useState } from "react";
import { ZoomableImage } from "@/components/ZoomableImage";

/**
 * Foto grande (con zoom tipo lupa) + miniaturas clicables debajo, para
 * productos con más de una foto. Antes las miniaturas eran decorativas —
 * se veían pero no hacían nada al hacer clic — así que subir fotos alternas
 * no le servía de nada al cliente para inspeccionar el producto de cerca.
 */
export function ProductGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [seleccionada, setSeleccionada] = useState(0);
  const activa = photos[seleccionada] ?? photos[0];

  return (
    <div>
      <div className="relative grid h-[400px] place-items-center overflow-hidden rounded-2xl bg-white/[.05] text-vt-muted-3">
        <ZoomableImage
          // Cambia de `key` en cada foto para que el zoom (y su estado de
          // "está haciendo zoom ahora") se reinicie limpio al cambiar de
          // imagen, en vez de arrastrar el acercamiento de la foto anterior.
          key={activa}
          src={activa}
          alt={alt}
          containerClassName="absolute inset-0 h-full w-full cursor-zoom-in overflow-hidden"
          className="h-full w-full object-contain p-6"
        />
      </div>

      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setSeleccionada(i)}
              aria-label={`Ver foto ${i + 1} de ${photos.length}`}
              aria-current={i === seleccionada}
              className={`relative grid h-20 place-items-center overflow-hidden rounded-xl bg-white/[.05] transition-colors ${
                i === seleccionada
                  ? "ring-2 ring-vt-accent"
                  : "ring-1 ring-white/10 hover:ring-white/30"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-contain p-1.5"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
