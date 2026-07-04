import crypto from "crypto";

/**
 * Cliente para Recurrente (https://recurrente.com), pasarela de pagos guatemalteca.
 * Verificar siempre los nombres exactos de campos contra https://docs.recurrente.com
 * antes de pasar a producción — este adaptador usa el esquema público documentado
 * (checkouts + items + success/cancel URL + webhooks firmados) pero Recurrente puede
 * ajustar detalles menores del payload entre versiones de su API.
 */

const RECURRENTE_API_BASE = "https://app.recurrente.com/api";

type CheckoutItem = {
  name: string;
  quantity: number;
  amountInCents: number;
};

type CreateCheckoutParams = {
  items: CheckoutItem[];
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

export async function createRecurrenteCheckout(params: CreateCheckoutParams) {
  const secretKey = process.env.RECURRENTE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Falta RECURRENTE_SECRET_KEY en el entorno.");
  }

  const res = await fetch(`${RECURRENTE_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-SECRET-KEY": secretKey,
    },
    body: JSON.stringify({
      items: params.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        currency: "GTQ",
        amount_in_cents: item.amountInCents,
      })),
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Recurrente respondió ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { id: string; checkout_url: string };
  return { id: data.id, checkoutUrl: data.checkout_url };
}

export function verifyRecurrenteWebhookSignature(rawBody: string, signatureHeader: string | null) {
  const webhookSecret = process.env.RECURRENTE_WEBHOOK_SECRET;
  if (!webhookSecret || !signatureHeader) return false;

  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}
