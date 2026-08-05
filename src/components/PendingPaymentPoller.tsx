"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const POLL_MS = 3000;
// ~2 minutos: el webhook normalmente llega en segundos; si tarda más que
// esto, mejor dejar de sondear que dejar un temporizador corriendo para
// siempre en una pestaña que el cliente ya olvidó abierta.
const MAX_ATTEMPTS = 40;

/**
 * En un pedido probado con dinero real (2026-08-05) el webhook tardó en
 * llegar y la pantalla se quedó en "Procesando tu pago…" sin ninguna señal
 * de que hubiera pasado algo — el cliente hubiera tenido que recargar a
 * mano para enterarse de que sí se confirmó. Este componente sondea el
 * estado del pedido y refresca la página sola en cuanto cambia.
 */
export function PendingPaymentPoller({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();

  useEffect(() => {
    if (status !== "PENDING") return;

    let cancelled = false;
    let attempts = 0;
    const interval = setInterval(async () => {
      if (cancelled) return;
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(interval);
        return;
      }
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { status: string };
        if (data.status !== "PENDING") {
          cancelled = true;
          clearInterval(interval);
          router.refresh();
        }
      } catch {
        // Se reintenta en el siguiente tick.
      }
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [orderId, status, router]);

  return null;
}
