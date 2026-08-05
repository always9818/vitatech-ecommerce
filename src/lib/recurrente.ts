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

/**
 * Confirmado con el primer webhook real (2026-08-05): Recurrente NO firma
 * sus webhooks con un HMAC simple del body — los despacha a través de Svix
 * (los headers vienen como `svix-id` / `svix-timestamp` / `svix-signature`,
 * y RECURRENTE_WEBHOOK_SECRET empieza con "whsec_", el prefijo propio de
 * Svix). El esquema real: HMAC-SHA256 de "{id}.{timestamp}.{body}" con la
 * llave decodificada de base64 (quitando el prefijo "whsec_"), codificado a
 * base64. El header puede traer varias firmas separadas por espacio
 * ("v1,firma1 v1,firma2") por rotación de llaves — basta con que una calce.
 * Ver https://docs.svix.com/receiving/verifying-payloads/how-manual.
 */
export function verifyRecurrenteWebhookSignature(
  rawBody: string,
  headers: { svixId: string | null; svixTimestamp: string | null; svixSignature: string | null }
): boolean {
  const webhookSecret = process.env.RECURRENTE_WEBHOOK_SECRET;
  const { svixId, svixTimestamp, svixSignature } = headers;
  if (!webhookSecret || !svixId || !svixTimestamp || !svixSignature) return false;

  // Tolerancia de 5 minutos contra ataques de repetición con una firma vieja
  // capturada — recomendado por la propia documentación de Svix.
  const timestampSeconds = Number(svixTimestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 300) {
    return false;
  }

  const secretBytes = Buffer.from(webhookSecret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secretBytes).update(signedContent).digest("base64");
  const expectedBuffer = Buffer.from(expected);

  return svixSignature
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter((candidate): candidate is string => Boolean(candidate))
    .some((candidate) => {
      const candidateBuffer = Buffer.from(candidate, "base64");
      return (
        candidateBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(expectedBuffer, candidateBuffer)
      );
    });
}
