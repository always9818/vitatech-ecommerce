"use client";

import { useRef, useState, useSyncExternalStore } from "react";

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * Si el dispositivo tiene cursor de verdad (mouse), no un dedo. Con
 * `useSyncExternalStore` en vez de `useEffect` + `setState`: es la forma que
 * React recomienda para leer algo del navegador que puede cambiar solo — una
 * laptop con pantalla táctil puede conectar un mouse a media sesión — y evita
 * el render en cascada de llamar `setState` dentro de un efecto.
 */
function useHoverCapable() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(HOVER_QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(HOVER_QUERY).matches,
    // Snapshot del servidor: no hay `window` ahí, así que se asume "sin
    // cursor" hasta que el cliente confirme lo contrario.
    () => false
  );
}

/**
 * Imagen con zoom tipo lupa: al mover el cursor sobre la foto, se acerca
 * siguiendo esa posición — el mismo patrón que Amazon o Best Buy usan en la
 * ficha de producto para que el cliente inspeccione el detalle sin tener que
 * abrir la imagen en otra pestaña.
 *
 * Solo se activa con `(hover: hover) and (pointer: fine)`: en una pantalla
 * táctil no hay cursor que seguir, y sin este chequeo el primer toque
 * dispararía un zoom pegado en cualquier punto donde cayó el dedo, sin forma
 * de quitarlo hasta tocar en otro lado.
 */
export function ZoomableImage({
  src,
  alt,
  className,
  containerClassName,
  zoomScale = 2.2,
}: {
  src: string;
  alt: string;
  /** Clases de la imagen (tamaño, encaje, etc.), igual que un <img> normal. */
  className?: string;
  /** Clases del contenedor: debe traer `relative overflow-hidden`. */
  containerClassName?: string;
  zoomScale?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const puedeHacerHover = useHoverCapable();

  const actualizarOrigen = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setOrigin(`${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`);
  };

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      onMouseEnter={(e) => {
        if (!puedeHacerHover) return;
        setZooming(true);
        actualizarOrigen(e.clientX, e.clientY);
      }}
      onMouseMove={(e) => zooming && actualizarOrigen(e.clientX, e.clientY)}
      onMouseLeave={() => setZooming(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="eager"
        className={className}
        style={{
          transformOrigin: origin,
          transform: zooming ? `scale(${zoomScale})` : "scale(1)",
          // Sin transición mientras se mueve el cursor: un `transition` ahí
          // hace que la imagen "persiga" al mouse en vez de seguirlo al
          // instante. Sí se anima al entrar y al salir, para que el cambio de
          // escala no sea un salto brusco.
          transition: zooming ? "transform 300ms ease-out" : "transform 200ms ease-in",
        }}
      />
      {/* Pista visual de que la imagen es explorable. Solo se pinta en
          dispositivos con cursor de verdad (no en táctil, donde no tendría
          sentido) y desaparece en cuanto empieza el zoom. */}
      {puedeHacerHover && !zooming && (
        <span className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
            <path d="M11 8v6M8 11h6" />
          </svg>
          Acercar
        </span>
      )}
    </div>
  );
}
