/**
 * Eventos de conversión para Meta Pixel y Google Analytics 4. Los scripts de
 * layout.tsx ya crean `window.fbq`/`window.gtag` como "colas" que aceptan
 * llamadas desde el primer instante (encolan hasta que el script real
 * termine de cargar) — así que es seguro llamarlas apenas se monta un
 * componente, sin esperar nada. Si GA o el Pixel nunca se configuraron
 * (faltan los env vars), esas funciones no existen en `window` y las
 * llamadas se ignoran solas, sin romper nada.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const CURRENCY = "GTQ";

export type TrackedItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
};

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") window.fbq(...args);
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") window.gtag(...args);
}

function toGa4Items(items: TrackedItem[]) {
  return items.map((it) => ({
    item_id: it.id,
    item_name: it.name,
    price: it.price,
    quantity: it.quantity,
    item_category: it.category,
  }));
}

/** Ficha de producto vista. */
export function trackViewContent(item: Omit<TrackedItem, "quantity">) {
  fbq("track", "ViewContent", {
    content_ids: [item.id],
    content_type: "product",
    content_name: item.name,
    value: item.price,
    currency: CURRENCY,
  });
  gtag("event", "view_item", {
    currency: CURRENCY,
    value: item.price,
    items: toGa4Items([{ ...item, quantity: 1 }]),
  });
}

/** Agregado al carrito, desde la ficha de producto o el catálogo. */
export function trackAddToCart(item: TrackedItem) {
  const value = item.price * item.quantity;
  fbq("track", "AddToCart", {
    content_ids: [item.id],
    content_type: "product",
    content_name: item.name,
    value,
    currency: CURRENCY,
  });
  gtag("event", "add_to_cart", {
    currency: CURRENCY,
    value,
    items: toGa4Items([item]),
  });
}

/** Llegó a la pantalla de datos de envío con el carrito lleno. */
export function trackInitiateCheckout(items: TrackedItem[], value: number) {
  fbq("track", "InitiateCheckout", {
    content_ids: items.map((it) => it.id),
    contents: items.map((it) => ({ id: it.id, quantity: it.quantity })),
    num_items: items.reduce((a, it) => a + it.quantity, 0),
    value,
    currency: CURRENCY,
  });
  gtag("event", "begin_checkout", {
    currency: CURRENCY,
    value,
    items: toGa4Items(items),
  });
}

/** Pedido confirmado como pagado (nunca antes de que Recurrente lo confirme). */
export function trackPurchase(orderId: string, items: TrackedItem[], value: number) {
  fbq("track", "Purchase", {
    content_ids: items.map((it) => it.id),
    contents: items.map((it) => ({ id: it.id, quantity: it.quantity })),
    value,
    currency: CURRENCY,
  });
  gtag("event", "purchase", {
    transaction_id: orderId,
    currency: CURRENCY,
    value,
    items: toGa4Items(items),
  });
}
