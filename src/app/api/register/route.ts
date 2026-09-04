import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { enviarVerificacion } from "@/lib/email-verification";

const registerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Ingresa un correo válido."),
  // Seis era poco para una tienda que guarda direcciones de entrega.
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ese correo ya está registrado." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  // La cuenta queda usable de inmediato: confirmar el correo NO es un candado
  // para entrar. Sirve para saber que se le puede escribir de verdad y para
  // poder adoptarle los pedidos que haya hecho como invitado.
  //
  // En su propio try/catch: que Resend falle no debe romper un registro que ya
  // quedó guardado. El cliente puede pedir otro enlace desde Mi cuenta.
  try {
    await enviarVerificacion(user.id, user.email);
  } catch (err) {
    console.error("[registro] No se pudo enviar el enlace de verificación a %s: %o", user.email, err);
  }

  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
