import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmailVerificationEmail } from "@/lib/email";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Verificación del correo de una cuenta nueva.
 *
 * NO es un candado para entrar: quien no confirma sigue pudiendo iniciar
 * sesión y comprar. Bloquear el login habría dejado fuera a las cuentas que
 * ya existían, que tienen `emailVerified` en null y nunca recibieron ningún
 * enlace. Lo que la confirmación aporta es saber que al cliente se le puede
 * escribir de verdad, y poder enlazarle los pedidos que hizo como invitado.
 *
 * Este archivo NO lleva "use server" a propósito: son funciones internas, no
 * endpoints. Todo export de un archivo "use server" es una URL pública, y una
 * de estas recibe un userId por argumento — exactamente el agujero que se
 * cerró en shipping-store.ts. Las Server Actions viven en
 * email-verification-actions.ts.
 */

function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/** Crea un enlace nuevo e invalida los anteriores sin usar. */
export async function enviarVerificacion(userId: string, email: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Solo el enlace más reciente debe funcionar, igual que en el flujo de
  // contraseña: pedir uno nuevo deja inservibles los que quedaron en correos
  // viejos.
  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId, usedAt: null } }),
    prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await sendEmailVerificationEmail(email, `${appUrl}/verificar-correo?token=${rawToken}`);
}

export type ResultadoVerificacion =
  | { ok: true; pedidosEnlazados: number }
  | { ok: false; motivo: string };

/**
 * Confirma el correo y le adopta los pedidos que hizo como invitado.
 *
 * El enlace de pedidos solo es seguro DESPUÉS de confirmar: hasta ese momento
 * nadie ha probado que el correo sea suyo, y adoptar por correo sin verificar
 * dejaría que cualquiera se registrara con la dirección ajena para reclamar
 * las compras de otro. Por eso esta función hace las dos cosas juntas.
 */
export async function confirmarCorreo(rawToken: string): Promise<ResultadoVerificacion> {
  if (!rawToken) return { ok: false, motivo: "Falta el token." };

  const token = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    select: { id: true, userId: true, usedAt: true, expiresAt: true },
  });

  if (!token) return { ok: false, motivo: "Este enlace no es válido." };
  if (token.usedAt) return { ok: false, motivo: "Este enlace ya se usó." };
  if (token.expiresAt < new Date()) return { ok: false, motivo: "Este enlace ya venció. Pide uno nuevo desde Mi cuenta." };

  const user = await prisma.user.findUnique({
    where: { id: token.userId },
    select: { email: true },
  });
  if (!user) return { ok: false, motivo: "Esta cuenta ya no existe." };

  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { emailVerified: new Date() } }),
    prisma.emailVerificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
  ]);

  // Va fuera de la transacción y con su propio catch: el correo ya quedó
  // confirmado, y que falle la adopción de pedidos viejos no debe deshacer eso.
  let pedidosEnlazados = 0;
  try {
    const adoptados = await prisma.order.updateMany({
      where: { userId: null, guestEmail: user.email },
      data: { userId: token.userId },
    });
    pedidosEnlazados = adoptados.count;
  } catch (err) {
    console.error("[verificacion] No se pudieron enlazar los pedidos de invitado: %o", err);
  }

  return { ok: true, pedidosEnlazados };
}
