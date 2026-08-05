"use client";

import { useEffect } from "react";
import { trackPurchase, type TrackedItem } from "@/lib/tracking";

/**
 * El cliente puede recargar la pantalla de "Pedido confirmado" varias veces
 * (o volver con el botón atrás) y cada carga vuelve a montar este
 * componente. Sin este seguro, cada recarga contaría como una compra nueva
 * en Meta y en Analytics. Se guarda en localStorage que ya se contó, por
 * pedido — no es a prueba de balas (se pierde en modo incógnito o si el
 * cliente borra el almacenamiento), pero cubre el caso real de "recargué la
 * página sin querer", que es el que de verdad iba a inflar los números.
 */
export function PurchaseTracker({
  orderId,
  items,
  value,
}: {
  orderId: string;
  items: TrackedItem[];
  value: number;
}) {
  useEffect(() => {
    const key = `vt_purchase_tracked_${orderId}`;
    if (window.localStorage.getItem(key)) return;
    trackPurchase(orderId, items, value);
    window.localStorage.setItem(key, "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return null;
}
