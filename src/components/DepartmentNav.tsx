"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { DEPARTMENTS, type Department } from "@/lib/departments";

export type DepartmentNavItem = {
  department: Department;
  categories: { id: string; name: string }[];
};

/**
 * Menú de departamentos con su lista de categorías.
 *
 * Se abre con clic y no con `:hover` a propósito: un menú de hover es
 * inalcanzable en pantalla táctil, que es por donde entra la mayoría de los
 * clientes en Guatemala. Cierra al hacer clic fuera, con Escape, y al navegar.
 */
export function DepartmentNav({ items }: { items: DepartmentNavItem[] }) {
  const [abierto, setAbierto] = useState<Department | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    const alClicFuera = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setAbierto(null);
    };
    const alEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(null);
    };

    document.addEventListener("mousedown", alClicFuera);
    document.addEventListener("keydown", alEscape);
    return () => {
      document.removeEventListener("mousedown", alClicFuera);
      document.removeEventListener("keydown", alEscape);
    };
  }, [abierto]);

  return (
    <div ref={navRef} className="flex items-center gap-1">
      {items.map(({ department, categories }) => {
        const info = DEPARTMENTS[department];
        const estaAbierto = abierto === department;

        return (
          <div key={department} className="relative">
            <button
              type="button"
              onClick={() => setAbierto(estaAbierto ? null : department)}
              aria-expanded={estaAbierto}
              aria-haspopup="true"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors ${
                estaAbierto ? "text-vt-accent" : "text-vt-fg hover:text-vt-accent"
              }`}
            >
              <Icon name={info.icon} className="h-[17px] w-[17px]" />
              {info.label}
              <Icon
                name="chevronRight"
                className={`h-3.5 w-3.5 transition-transform ${estaAbierto ? "rotate-90" : "rotate-90 opacity-50"}`}
              />
            </button>

            {estaAbierto && (
              <div className="absolute top-full left-0 z-50 mt-1 min-w-[220px] overflow-hidden rounded-xl border border-white/10 bg-[rgba(18,26,9,.98)] py-1.5 shadow-[0_18px_40px_rgba(0,0,0,.5)] backdrop-blur">
                <Link
                  href={`/catalogo?dept=${info.slug}`}
                  onClick={() => setAbierto(null)}
                  className="block px-4 py-2.5 text-[13px] font-bold text-vt-accent hover:bg-white/[.05]"
                >
                  Ver todo en {info.label}
                </Link>
                <div className="my-1 border-t border-white/10" />
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/catalogo?dept=${info.slug}&cat=${encodeURIComponent(c.name)}`}
                    onClick={() => setAbierto(null)}
                    className="block px-4 py-2.5 text-[13px] font-semibold text-vt-fg hover:bg-white/[.05] hover:text-vt-accent"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
