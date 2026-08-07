"use server";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { GUEST_COOKIE } from "@/lib/cart-constants";

// La sesión es un JWT firmado que sobrevive a que se borre la cuenta que lo
// firmó (ej. un admin elimina un usuario de prueba a mano en la base). Si esa
// sesión vieja intenta crear un carrito, Postgres rechaza el INSERT porque
// `userId` ya no existe en `User` — Prisma lo reporta como P2003.
function isMissingUserError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003";
}

// Solo debe llamarse desde Server Actions reales (los exports mutantes de abajo):
// escribe la cookie de invitado, lo cual Next.js prohíbe durante el render de un
// Server Component (p. ej. cuando el Header solo quiere leer el carrito).
// Todas las lecturas del carrito piden explícitamente solo `id`: sin un
// `select`, Prisma trae también `couponId`, columna que únicamente existe
// después de `prisma db push`. Como el Header llama a cartCount() en cada
// página, esa consulta fallando tumbaría el sitio entero.
const CART_ID_ONLY = { id: true } as const;

async function getOrCreateCart() {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    try {
      const cart = await prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
        select: CART_ID_ONLY,
      });
      return cart;
    } catch (err) {
      if (!isMissingUserError(err)) throw err;
      // No hay carrito válido que crear para una cuenta que ya no existe.
      // Parchar el carrito (ej. caer al flujo de invitado) dejaría el
      // producto guardado en un carrito que el cliente nunca vería — peor
      // que el error. Lo correcto es cerrar esa sesión vieja: `signOut`
      // redirige, así que esto nunca vuelve (lanza internamente).
      await signOut({ redirectTo: "/login?error=session-expired" });
      throw err;
    }
  }

  const cookieStore = await cookies();
  let guestId = cookieStore.get(GUEST_COOKIE)?.value;
  if (!guestId) {
    guestId = randomUUID();
    cookieStore.set(GUEST_COOKIE, guestId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
    });
  }

  const cart = await prisma.cart.upsert({
    where: { guestId },
    update: {},
    create: { guestId },
    select: CART_ID_ONLY,
  });
  return cart;
}

// Lectura segura para usar durante el render (Server Components): nunca escribe
// cookies. Si el invitado todavía no tiene carrito, simplemente no hay items.
async function findExistingCart() {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    return prisma.cart.findUnique({ where: { userId }, select: CART_ID_ONLY });
  }

  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE)?.value;
  if (!guestId) return null;

  return prisma.cart.findUnique({ where: { guestId }, select: CART_ID_ONLY });
}

export async function getCart() {
  const cart = await findExistingCart();
  if (!cart) return [];

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: { include: { category: true } } },
    orderBy: { id: "asc" },
  });
  return items;
}

export async function addToCart(productId: string, quantity = 1) {
  const cart = await getOrCreateCart();
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  const nextQty = Math.min(product.stock, (existing?.quantity ?? 0) + quantity);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: nextQty },
    create: { cartId: cart.id, productId, quantity: nextQty },
  });

  revalidatePath("/", "layout");
}

export async function changeCartQty(productId: string, delta: number) {
  const cart = await getOrCreateCart();
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  if (!existing) return;

  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const nextQty = Math.min(product.stock, existing.quantity + delta);

  if (nextQty <= 0) {
    await prisma.cartItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQty } });
  }

  revalidatePath("/", "layout");
}

export async function removeCartItem(productId: string) {
  const cart = await getOrCreateCart();
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  revalidatePath("/", "layout");
}

export async function cartCount() {
  const items = await getCart();
  return items.reduce((a, it) => a + it.quantity, 0);
}
