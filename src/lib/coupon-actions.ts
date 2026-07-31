"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GUEST_COOKIE } from "@/lib/cart-constants";
import { isCouponValid } from "@/lib/coupon-utils";

export type CouponState = { error?: string; success?: boolean };

// `Coupon` y `Cart.couponId` solo existen tras correr `prisma db push`. Hasta
// entonces cualquier consulta de cupones falla; se degrada a "sin cupón" (el
// carrito sigue funcionando, solo sin descuentos) y se deja rastro en los logs.
function onCouponQueryError<T>(context: string, fallback: T) {
  return (err: unknown): T => {
    console.error("[cupones] %s falló (¿falta `prisma db push`?): %o", context, err);
    return fallback;
  };
}

const CART_WITH_COUPON = { id: true, couponId: true } as const;

async function findExistingCart() {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    return prisma.cart
      .findUnique({ where: { userId }, select: CART_WITH_COUPON })
      .catch(onCouponQueryError("findExistingCart", null));
  }

  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE)?.value;
  if (!guestId) return null;

  return prisma.cart
    .findUnique({ where: { guestId }, select: CART_WITH_COUPON })
    .catch(onCouponQueryError("findExistingCart", null));
}

export async function applyCoupon(_prevState: CouponState, formData: FormData): Promise<CouponState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return { error: "Escribe un código de descuento." };

  const cart = await findExistingCart();
  if (!cart) return { error: "Tu carrito está vacío." };

  try {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon) return { error: "Ese código no existe." };

    const invalidReason = isCouponValid(coupon);
    if (invalidReason) return { error: invalidReason };

    await prisma.cart.update({ where: { id: cart.id }, data: { couponId: coupon.id } });
  } catch (err) {
    console.error("[cupones] applyCoupon falló (¿falta `prisma db push`?): %o", err);
    return { error: "No se pudo aplicar el código en este momento." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function removeCoupon() {
  const cart = await findExistingCart();
  if (!cart) return;
  await prisma.cart
    .update({ where: { id: cart.id }, data: { couponId: null } })
    .catch(onCouponQueryError("removeCoupon", null));
  revalidatePath("/", "layout");
}

export async function getCartCoupon() {
  const cart = await findExistingCart();
  if (!cart?.couponId) return null;

  const coupon = await prisma.coupon
    .findUnique({ where: { id: cart.couponId } })
    .catch(onCouponQueryError("getCartCoupon", null));
  if (!coupon) return null;

  if (isCouponValid(coupon)) {
    await prisma.cart
      .update({ where: { id: cart.id }, data: { couponId: null } })
      .catch(onCouponQueryError("getCartCoupon:clear", null));
    return null;
  }
  return coupon;
}
