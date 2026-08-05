import crypto from "crypto";

/**
 * Cliente para Recurrente (https://recurrente.com), pasarela de pagos guatemalteca.
 * Verificar siempre los nombres exactos de campos contra https://docs.recurrente.com
 * antes de pasar a producción — este adaptador usa el esquema público documentado
 * (checkouts + items + success/cancel URL + webhooks firmados) pero Recurrente puede
 * ajustar detalles menores del payload entre versiones de su API.
 */

const RECURRENTE_API_BASE = "https://app.recurrente.com/api";

/**
 * Plazos de cuotas habilitados en el panel de Recurrente para VITATECH
 * (Configuración → Métodos de Pago → Cuotas). El cliente paga el mismo total
 * elija o no cuotas — Recurrente le descuenta la comisión (8% a 3 meses, 9% a
 * 6, 10% a 12) al saldo del comercio, no al cliente, así que "sin intereses"
 * es literal para quien compra.
 */
export const AVAILABLE_INSTALLMENTS = [3, 6, 12];

type CheckoutItem = {
  name: string;
  quantity: number;
  amountInCents: number;
  availableInstallments?: number[];
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
        ...(item.availableInstallments?.length ? { available_installments: item.availableInstallments } : {}),
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
