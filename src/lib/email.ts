/**
 * Envío de correo transaccional via Resend (https://resend.com), con fetch
 * directo en vez de su SDK — igual que el cliente de Recurrente — para no
 * sumar una dependencia solo por un par de llamadas.
 */

import { SITE_URL } from "@/lib/site";
import { money } from "@/lib/money";

const RESEND_API_BASE = "https://api.resend.com";

function isEmailEnabled() {
  return Boolean(process.env.RESEND_API_KEY);
}

async function sendEmail(params: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No se lanza al que hizo la solicitud: quien pide restablecer su
    // contraseña no debe enterarse de un detalle de configuración interna.
    // Sí queda visible en `wrangler tail` para diagnosticar.
    console.error("[email] RESEND_API_KEY no configurada; no se envió el correo a", params.to);
    return;
  }

  // Mientras no se verifique importadoravitatech.com en Resend, se envía desde
  // su dominio compartido (onboarding@resend.dev). OJO: ese remitente NO envía
  // a cualquier destinatario — Resend lo restringe únicamente al correo dueño
  // de la cuenta (confirmado: falla con 403 "You can only send testing emails
  // to your own email address" contra cualquier otro correo). Hasta que se
  // verifique un dominio propio, el envío a clientes reales no funciona.
  // RESEND_FROM_EMAIL permite pasar a un remitente propio en cuanto se verifique.
  const from = process.env.RESEND_FROM_EMAIL || "Vitatech <onboarding@resend.dev>";

  const res = await fetch(`${RESEND_API_BASE}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to: params.to, subject: params.subject, html: params.html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[email] Resend respondió ${res.status} al enviar a ${params.to}: ${body}`);
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!isEmailEnabled()) {
    console.error("[email] Envío de correo deshabilitado (falta RESEND_API_KEY); enlace no enviado:", resetUrl);
    return;
  }

  await sendEmail({
    to,
    subject: "Restablece tu contraseña de VITATECH",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a2e05;">
        <h1 style="font-size: 20px;">Restablece tu contraseña</h1>
        <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta en Importadora Vitatech.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #a3e635; color: #1a2e05; font-weight: bold; padding: 12px 24px; border-radius: 10px; text-decoration: none;">
            Crear una contraseña nueva
          </a>
        </p>
        <p style="font-size: 13px; color: #57534e;">
          Este enlace vence en 1 hora y solo funciona una vez. Si tú no pediste este cambio, puedes ignorar este correo.
        </p>
      </div>
    `,
  });
}

export async function sendAbandonedCartEmail(
  to: string,
  cart: { name: string | null; items: { name: string; quantity: number; price: number }[]; total: number }
) {
  if (!isEmailEnabled()) {
    console.error("[email] Envío de correo deshabilitado (falta RESEND_API_KEY); recordatorio no enviado a", to);
    return;
  }

  const saludo = cart.name ? `Hola, ${cart.name.split(" ")[0]}` : "Hola";
  const filas = cart.items
    .map(
      (it) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e7e5e4;">
            ${it.name}${it.quantity > 1 ? ` <span style="color: #78716c;">× ${it.quantity}</span>` : ""}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e7e5e4; text-align: right; white-space: nowrap;">
            ${money(it.price * it.quantity)}
          </td>
        </tr>`
    )
    .join("");

  await sendEmail({
    to,
    subject: "Dejaste algo en tu carrito de VITATECH",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a2e05;">
        <h1 style="font-size: 20px;">${saludo}, todavía tienes esto en tu carrito</h1>
        <p>No completaste tu compra en Importadora Vitatech. Tus productos siguen guardados, por si quieres terminarla.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          ${filas}
          <tr>
            <td style="padding: 10px 0; font-weight: bold;">Total</td>
            <td style="padding: 10px 0; font-weight: bold; text-align: right;">${money(cart.total)}</td>
          </tr>
        </table>
        <p>
          <a href="${SITE_URL}/carrito" style="display: inline-block; background: #a3e635; color: #1a2e05; font-weight: bold; padding: 12px 24px; border-radius: 10px; text-decoration: none;">
            Terminar mi compra
          </a>
        </p>
        <p style="font-size: 13px; color: #57534e;">
          Si ya no te interesa, puedes ignorar este correo — tu carrito no vence.
        </p>
      </div>
    `,
  });
}
