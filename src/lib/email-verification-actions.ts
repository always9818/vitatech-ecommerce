"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { confirmarCorreo, enviarVerificacion } from "@/lib/email-verification";

/**
 * Server Actions del flujo de verificación. La lógica vive en
 * `email-verification.ts`, que NO es "use server": ahí `enviarVerificacion`
 * recibe un userId por argumento y publicarla como endpoint dejaría que
 * cualquiera disparara correos a nombre de otra cuenta.
 */

export type ReenvioState = { ok?: boolean; error?: string };

/** Botón "reenviar" de Mi cuenta. El usuario sale de la sesión, nunca de un argumento. */
export async function reenviarVerificacion(): Promise<ReenvioState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión." };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, emailVerified: true },
  });
  if (!user) return { error: "Esta cuenta ya no existe." };
  if (user.emailVerified) return { ok: true };

  try {
    await enviarVerificacion(session.user.id, user.email);
  } catch (err) {
    console.error("[verificacion] No se pudo reenviar el enlace: %o", err);
    return { error: "No se pudo enviar el correo. Intenta de nuevo en un momento." };
  }

  return { ok: true };
}

export type ConfirmarState = { done?: boolean; pedidosEnlazados?: number; error?: string };

/**
 * Confirma el correo desde el botón de /verificar-correo.
 *
 * Es un POST y no un GET a propósito: hay filtros de seguridad de correo
 * corporativo que abren los enlaces para revisarlos, y con un GET que muta,
 * ese robot gastaría el token antes que la persona. Mismo criterio que el
 * flujo de contraseña, donde la página solo valida y el cambio va por POST.
 */
export async function confirmarCorreoAction(
  _prevState: ConfirmarState,
  formData: FormData
): Promise<ConfirmarState> {
  const token = String(formData.get("token") ?? "");
  const resultado = await confirmarCorreo(token);

  if (!resultado.ok) return { error: resultado.motivo };

  revalidatePath("/cuenta");
  return { done: true, pedidosEnlazados: resultado.pedidosEnlazados };
}

/** Solo lectura, para que la página sepa si mostrar el botón o un aviso. */
export async function estadoDelToken(rawToken: string): Promise<{ valido: boolean; motivo?: string }> {
  if (!rawToken) return { valido: false, motivo: "Falta el token." };

  const crypto = await import("crypto");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const token = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    select: { usedAt: true, expiresAt: true },
  });

  if (!token) return { valido: false, motivo: "Este enlace no es válido." };
  if (token.usedAt) return { valido: false, motivo: "Este enlace ya se usó." };
  if (token.expiresAt < new Date()) return { valido: false, motivo: "Este enlace ya venció." };
  return { valido: true };
}
