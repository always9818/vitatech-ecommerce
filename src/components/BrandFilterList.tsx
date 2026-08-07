"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function BrandFilterList({ brands }: { brands: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = new Set(searchParams.get("brand")?.split(",").filter(Boolean) ?? []);

  const toggle = (name: string) => {
    const next = new Set(active);
    if (next.has(name)) next.delete(name);
    else next.add(name);

    const params = new URLSearchParams(searchParams.toString());
    if (next.size) params.set("brand", Array.from(next).join(","));
    else params.delete("brand");
    // Sin esto, cambiar de marca estando en la página 3 dejaba `page=3` en la
    // URL: si el nuevo filtro tenía menos páginas, el catálogo caía en la
    // última válida en vez de mostrar los resultados desde el principio.
    params.delete("page");
    router.push(`/catalogo?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-2">
      {brands.map((b) => {
        const isActive = active.has(b.name);
        return (
          <label
            key={b.id}
            className="flex cursor-pointer items-center gap-2.5 text-[13px] text-vt-fg"
          >
            <span
              onClick={() => toggle(b.name)}
              className="grid h-[15px] w-[15px] place-items-center rounded"
              style={{
                border: `1.5px solid ${isActive ? "#a3e635" : "rgba(163,230,53,.5)"}`,
                background: isActive ? "#a3e635" : "transparent",
                color: "#1a2e05",
                fontSize: "11px",
                fontWeight: 800,
              }}
            >
              {isActive ? "✓" : ""}
            </span>
            <span onClick={() => toggle(b.name)}>{b.name}</span>
          </label>
        );
      })}
    </div>
  );
}
