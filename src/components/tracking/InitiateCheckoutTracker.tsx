"use client";

import { useEffect } from "react";
import { trackInitiateCheckout, type TrackedItem } from "@/lib/tracking";

export function InitiateCheckoutTracker({ items, value }: { items: TrackedItem[]; value: number }) {
  useEffect(() => {
    trackInitiateCheckout(items, value);
    // Una vez por carga de la página, no en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
