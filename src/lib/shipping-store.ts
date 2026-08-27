import { prisma } from "@/lib/prisma";
import type { ShippingInput } from "@/lib/shipping";

/**
 * Guarda (o actualiza) la dirección predeterminada de un cliente.
 *
 * Vive aquí, en un archivo SIN "use server", a propósito. Antes estaba en
 * `shipping-actions.ts`, y en Next.js toda función exportada desde un archivo
 * "use server" se convierte en un endpoint público: como esta recibe el
 * `userId` por argumento en vez de sacarlo de la sesión, cualquiera podía
 * llamarla con el id de otra persona y sobrescribirle la dirección de entrega
 * (saltándose además `validateShipping`). Un pedido suyo habría salido hacia
 * donde quisiera el atacante.
 *
 * La usan dos sitios y ninguno necesita que sea una Server Action:
 * `saveShippingProfile` (que sí verifica la sesión antes de llamarla) y
 * `startCheckout` (que ya tiene el userId de `auth()`). Al no exportarse desde
 * un módulo "use server", deja de existir como endpoint.
 *
 * NO la reexportes desde `shipping-actions.ts`: reexportar la volvería a
 * publicar como Server Action y reintroduciría exactamente el mismo agujero.
 */
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
