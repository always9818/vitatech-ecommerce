export function money(n: number) {
  return "Q " + n.toLocaleString("es-GT");
}

export function discountPct(price: number, oldPrice: number) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}
