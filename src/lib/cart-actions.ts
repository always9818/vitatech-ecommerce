"use server";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const GUEST_COOKIE = "vt_guest_id";

// Solo debe llamarse desde Server Actions reales (los exports mutantes de abajo):
// escribe la cookie de invitado, lo cual Next.js prohíbe durante el render de un
// Server Component (p. ej. cuando el Header solo quiere leer el carrito).
async function getOrCreateCart() {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    return cart;
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
  });
  return cart;
}

// Lectura segura para usar durante el render (Server Components): nunca escribe
// cookies. Si el invitado todavía no tiene carrito, simplemente no hay items.
async function findExistingCart() {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    return prisma.cart.findUnique({ where: { userId } });
  }

  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE)?.value;
  if (!guestId) return null;

  return prisma.cart.findUnique({ where: { guestId } });
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
