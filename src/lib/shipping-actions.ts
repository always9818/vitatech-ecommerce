"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readShippingInput, validateShipping, type ShippingInput } from "@/lib/shipping";

// `values` devuelve lo que el cliente escribió: React 19 reinicia los campos no
// controlados después de ejecutar una acción de formulario, así que sin esto un
// error de validación le borraría todo lo tecleado.
export type ShippingFormState = { error?: string; ok?: boolean; values?: ShippingInput };

/** Guarda (o actualiza) la dirección predeterminada del cliente. */
export async function persistShippingProfile(userId: string, input: ShippingInput) {
  const data = {
    recipientName: input.recipientName,
    phone: input.phone,
    department: input.department,
    municipality: input.municipality,
    addressLine: input.addressLine,
    zone: input.zone || null,
    reference: input.reference || null,
  };

  await prisma.shippingProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

/** Devuelve la dirección guardada del usuario en sesión, o null. */
export async function getShippingProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.shippingProfile.findUnique({ where: { userId: session.user.id } });
}

/** Acción del formulario de "Mi cuenta". */
export async function saveShippingProfile(
  _prevState: ShippingFormState,
  formData: FormData
): Promise<ShippingFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión." };

  const input = readShippingInput(formData);
  const error = validateShipping(input);
  if (error) return { error, values: input };

  try {
    await persistShippingProfile(session.user.id, input);
  } catch {
    return { error: "No se pudo guardar la dirección. Intenta de nuevo.", values: input };
  }

  revalidatePath("/cuenta");
  revalidatePath("/checkout");
  return { ok: true, values: input };
}
