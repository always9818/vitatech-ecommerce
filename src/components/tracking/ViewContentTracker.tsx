"use client";

import { useEffect } from "react";
import { trackViewContent, type TrackedItem } from "@/lib/tracking";

export function ViewContentTracker({ item }: { item: Omit<TrackedItem, "quantity"> }) {
  useEffect(() => {
    trackViewContent(item);
    // Solo debe repetirse si cambia el producto, no en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  return null;
}
