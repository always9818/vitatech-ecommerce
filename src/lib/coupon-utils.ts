export function isCouponValid(coupon: {
  active: boolean;
  expiresAt: Date | null;
  usageLimit: number | null;
  usageCount: number;
}) {
  if (!coupon.active) return "Este cupón ya no está activo.";
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return "Este cupón ya expiró.";
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return "Este cupón ya alcanzó su límite de usos.";
  }
  return null;
}

export function computeCouponDiscount(
  coupon: { type: "PERCENT" | "FIXED"; value: number },
  subtotal: number
) {
  if (coupon.type === "PERCENT") {
    return Math.round((subtotal * coupon.value) / 100);
  }
  return Math.min(coupon.value, subtotal);
}
