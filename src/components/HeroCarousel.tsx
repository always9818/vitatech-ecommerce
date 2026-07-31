"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HeroSlideView } from "@/lib/hero-slides";
import { Icon } from "@/components/Icon";

const AUTOPLAY_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlideView[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number) => setIndex(((next % total) + total) % total), [total]);

  useEffect(() => {
    // Un solo diseño no necesita rotar; y si el visitante está interactuando o
    // pidió menos movimiento, no lo movemos por debajo.
    if (total <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    timer.current = setInterval(() => setIndex((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [total, paused]);

  if (total === 0) return null;

  return (
    <section
      aria-label="Promociones"
      aria-roledescription="carrusel"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[.04]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Alto por proporción: el banner crece con el ancho disponible en vez de
          quedarse en una caja fija. Más alto en móvil, donde lo que falta es
          ancho; 16/9 de escritorio para que case con el panel de al lado. */}
      <div className="relative aspect-[4/3] w-full min-[560px]:aspect-[16/9]">
        {slides.map((slide, i) => {
          const image = (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={slide.imageUrl}
              alt={slide.alt ?? ""}
              className="absolute inset-0 h-full w-full object-contain"
              loading={i === 0 ? "eager" : "lazy"}
            />
          );

          return (
            <div
              key={slide.id}
              aria-hidden={i !== index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {slide.linkUrl ? (
                <Link href={slide.linkUrl} tabIndex={i === index ? 0 : -1} className="block h-full w-full">
                  {image}
                </Link>
              ) : (
                image
              )}
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Diseño anterior"
            className="vt-btn absolute top-1/2 left-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur hover:border-vt-accent hover:text-vt-accent min-[640px]:left-5"
          >
            <Icon name="chevronLeft" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Diseño siguiente"
            className="vt-btn absolute top-1/2 right-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur hover:border-vt-accent hover:text-vt-accent min-[640px]:right-5"
          >
            <Icon name="chevronRight" className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/45 px-3 py-2 backdrop-blur">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ver diseño ${i + 1} de ${total}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-vt-accent" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
