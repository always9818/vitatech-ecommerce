"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export type RequestResetState = { done?: boolean; error?: string };

/**
 * Pide el enlace de restablecimiento. Siempre responde igual exista o no el
 * correo — decirlo distinto dejaría a cualquiera adivinar qué correos están
 * registrados en la tienda.
 */
export async function requestPasswordReset(
  _prevState: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Ingresa un correo válido." };
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Se invalidan los enlaces anteriores sin usar: solo el más reciente debe
    // funcionar, para que pedir uno nuevo deje inservibles los que quedaron
    // olvidados en un correo viejo.
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      }),
    ]);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/restablecer-contrasena?token=${rawToken}`;
    await sendPasswordResetEmail(email, resetUrl);
  }

  return { done: true };
}

export type VerifyTokenResult = { valid: true } | { valid: false; reason: string };

/** Para que la página de restablecer sepa si mostrar el formulario o un aviso. */
export async function verifyResetToken(rawToken: string): Promise<VerifyTokenResult> {
  if (!rawToken) return { valid: false, reason: "Falta el token." };

  const token = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!token) return { valid: false, reason: "Este enlace no es válido." };
  if (token.usedAt) return { valid: false, reason: "Este enlace ya se usó." };
  if (token.expiresAt < new Date()) return { valid: false, reason: "Este enlace ya venció." };

  return { valid: true };
}

export type ResetPasswordState = { error?: string; done?: boolean };

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const rawToken = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const token = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!token || token.usedAt || token.expiresAt < new Date()) {
    return { error: "Este enlace ya no es válido. Pide uno nuevo." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
  ]);

  return { done: true };
}
