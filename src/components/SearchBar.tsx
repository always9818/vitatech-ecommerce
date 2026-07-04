"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const [value, setValue] = useState(urlSearch);
  const [syncedWith, setSyncedWith] = useState(urlSearch);

  if (urlSearch !== syncedWith) {
    setSyncedWith(urlSearch);
    setValue(urlSearch);
  }

  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-vt-muted-2">
        🔍
      </span>
      <input
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          const params = new URLSearchParams();
          if (next.trim()) params.set("search", next);
          router.push(`/catalogo${params.toString() ? `?${params.toString()}` : ""}`);
        }}
        placeholder="Buscar productos..."
        className="w-full rounded-[99px] border border-white/10 bg-white/[.06] py-2.5 pr-4 pl-10 text-sm text-vt-fg placeholder:text-vt-muted-2 focus:border-vt-accent/50 focus:outline-none"
      />
    </div>
  );
}
