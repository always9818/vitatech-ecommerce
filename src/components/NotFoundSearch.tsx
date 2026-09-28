"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";

/**
 * Convierte la última parte de la dirección rota en algo que se pueda buscar:
 * `/producto/audifonos-bluetooth` → "audifonos bluetooth". Así el cliente que
 * llegó por un enlace viejo encuentra el buscador ya escrito.
 *
 * Devuelve "" cuando no hay nada legible que proponer. Los ids de producto
 * (cuid: una "c" y 20+ letras/números sin guiones) se descartan: buscar
 * "cmdx8k2…" siempre daría cero resultados.
 */
function terminoDesdeRuta(pathname: string): string {
  const ultimo = pathname.split("/").filter(Boolean).pop() ?? "";
  let texto: string;
  try {
    texto = decodeURIComponent(ultimo);
  } catch {
    return "";
  }
  if (/^c[a-z0-9]{20,}$/i.test(texto)) return "";
  texto = texto.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[-_+.]+/g, " ").trim();
  if (texto.length < 3 || texto.length > 60 || !/\p{L}{3}/u.test(texto)) return "";
  return texto.toLowerCase();
}

export function NotFoundSearch() {
  const pathname = usePathname() ?? "/";
  const termino = terminoDesdeRuta(pathname);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* La dirección que falló, tachada. Le confirma al cliente que el
          problema es el enlace y no su conexión. */}
      <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[.04] py-1.5 pr-4 pl-2.5 text-[12.5px] text-vt-muted-2">
        <Icon name="xCircle" className="h-4 w-4 flex-none text-vt-error/80" />
        <span className="truncate font-mono">
          importadoravitatech.com
          <span className="text-vt-muted-1 line-through decoration-vt-error/60">{pathname}</span>
        </span>
      </div>

      {/* Formulario GET normal: funciona incluso antes de que cargue el
          JavaScript, y cae en la misma búsqueda que la del encabezado. */}
      <form
        action="/catalogo"
        role="search"
        className="group relative flex w-full max-w-[520px] items-center rounded-full border border-white/12 bg-white/[.05] p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,.8)] transition-colors focus-within:border-vt-accent/60 focus-within:bg-white/[.07]"
      >
        <span className="pointer-events-none pl-3.5 text-vt-muted-2 transition-colors group-focus-within:text-vt-accent">
          <Icon name="search" className="h-[18px] w-[18px]" />
        </span>
        <label htmlFor="buscar-404" className="sr-only">
          Buscar productos
        </label>
        <input
          id="buscar-404"
          type="search"
          name="search"
          defaultValue={termino}
          placeholder="¿Qué estabas buscando?"
          autoComplete="off"
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] text-vt-fg placeholder:text-vt-muted-2 focus:outline-none"
        />
        <button
          type="submit"
          className="vt-btn vt-btn-accent flex-none rounded-full bg-vt-accent px-5 py-2.5 text-sm font-bold text-vt-accent-fg"
        >
          Buscar
        </button>
      </form>
    </div>
  );
}
