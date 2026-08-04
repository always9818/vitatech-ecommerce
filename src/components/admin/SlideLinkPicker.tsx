"use client";

import { useState, useTransition } from "react";
import { updateHeroSlideLink } from "@/lib/hero-slide-actions";
import { Icon } from "@/components/Icon";

export type DestinoOpcion = { valor: string; etiqueta: string };
export type DestinosDisponibles = {
  productos: DestinoOpcion[];
  categorias: DestinoOpcion[];
};

const selectClass =
  "w-full rounded-[10px] border border-white/10 bg-white/[.05] px-3 py-2 text-[13px] text-vt-fg focus:border-vt-accent/50 focus:outline-none";

/**
 * Selector del destino de un diseño del carrusel.
 *
 * Antes había que escribir la ruta a mano, lo que en la práctica hacía
 * inservible enlazar a un producto: el administrador habría tenido que buscar
 * un id como `/producto/cms9tu5m60003x91lso0kzql3`. Aquí se elige de una lista
 * y la ruta se arma sola.
 */
export function SlideLinkPicker({
  slideId,
  linkUrl,
  destinos,
}: {
  slideId: string;
  linkUrl: string | null;
  destinos: DestinosDisponibles;
}) {
  const [valor, setValor] = useState(linkUrl ?? "");
  const [guardado, setGuardado] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Si el destino guardado ya no está en la lista (producto eliminado u
  // oculto), se muestra igual para no perderlo en silencio.
  const conocido =
    !valor ||
    valor === "/catalogo" ||
    destinos.productos.some((p) => p.valor === valor) ||
    destinos.categorias.some((c) => c.valor === valor);

  return (
    <div className="flex items-center gap-2">
      <select
        value={valor}
        disabled={isPending}
        onChange={(e) => {
          const nuevo = e.target.value;
          setValor(nuevo);
          setGuardado(false);
          startTransition(async () => {
            await updateHeroSlideLink(slideId, nuevo);
            setGuardado(true);
          });
        }}
        className={selectClass}
        aria-label="A dónde lleva este diseño"
      >
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
        {!conocido && <option value={valor}>{valor} (destino ya no disponible)</option>}
      </select>

      {guardado && !isPending && (
        <span className="vt-check-pop flex-none text-vt-accent" title="Guardado">
          <Icon name="checkCircle" className="h-[18px] w-[18px]" />
        </span>
      )}
    </div>
  );
}
