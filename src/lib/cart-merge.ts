import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { GUEST_COOKIE } from "@/lib/cart-constants";

// Se llama desde el callback signIn de NextAuth (src/auth.ts), justo después
// de una autenticación exitosa. Vive en su propio módulo (no en
// cart-actions.ts) para no crear un import circular: cart-actions.ts ya
// importa `auth` desde src/auth.ts.
export async function mergeGuestCartIntoUser(userId: string) {
  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE)?.value;
  if (!guestId) return;

  const guestCart = await prisma.cart.findUnique({
    where: { guestId },
    include: { items: true },
  });

  if (guestCart) {
    if (guestCart.items.length > 0) {
      const userCart = await prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      for (const item of guestCart.items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        const existing = await prisma.cartItem.findUnique({
          where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
        });

        const nextQty = Math.min(product.stock, (existing?.quantity ?? 0) + item.quantity);

        await prisma.cartItem.upsert({
          where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
          update: { quantity: nextQty },
          create: { cartId: userCart.id, productId: item.productId, quantity: nextQty },
        });
      }
    }

    await prisma.cart.delete({ where: { id: guestCart.id } });
  }

  cookieStore.delete(GUEST_COOKIE);
}
