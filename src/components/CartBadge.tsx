"use client";

import { useEffect, useRef, useState } from "react";

export function CartBadge({ count }: { count: number }) {
  const [bump, setBump] = useState(0);
  const prev = useRef(count);

  useEffect(() => {
    if (count !== prev.current) {
      setBump((b) => b + 1);
      prev.current = count;
    }
  }, [count]);

  if (count <= 0) return null;

  return (
    <span
      key={bump}
      className="animate-vt-bump absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-vt-accent-fg"
    >
      {count}
    </span>
  );
}
