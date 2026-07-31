"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GUEST_COOKIE } from "@/lib/cart-constants";
import { isCouponValid } from "@/lib/coupon-utils";

export type CouponState = { error?: string; success?: boolean };

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

export async function applyCoupon(_prevState: CouponState, formData: FormData): Promise<CouponState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return { error: "Escribe un código de descuento." };

  const cart = await findExistingCart();
  if (!cart) return { error: "Tu carrito está vacío." };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) return { error: "Ese código no existe." };

  const invalidReason = isCouponValid(coupon);
  if (invalidReason) return { error: invalidReason };

  await prisma.cart.update({ where: { id: cart.id }, data: { couponId: coupon.id } });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function removeCoupon() {
  const cart = await findExistingCart();
  if (!cart) return;
  await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });
  revalidatePath("/", "layout");
}

export async function getCartCoupon() {
  const cart = await findExistingCart();
  if (!cart?.couponId) return null;
  const coupon = await prisma.coupon.findUnique({ where: { id: cart.couponId } });
  if (!coupon) return null;

  if (isCouponValid(coupon)) {
    await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });
    return null;
  }
  return coupon;
}
