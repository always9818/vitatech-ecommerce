"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "relevancia", label: "Relevancia" },
  { value: "menor", label: "Precio: menor a mayor" },
  { value: "mayor", label: "Precio: mayor a menor" },
  { value: "descuento", label: "Mayor descuento" },
];

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "relevancia";

  return (
    <select
      value={sort}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value === "relevancia") params.delete("sort");
        else params.set("sort", e.target.value);
        router.push(`/catalogo?${params.toString()}`);
      }}
      className="rounded-lg border border-white/10 bg-white/[.05] px-3 py-2 text-[13px] font-semibold text-vt-fg"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value} className="bg-vt-bg text-vt-fg">
          {o.label}
        </option>
      ))}
    </select>
  );
}
