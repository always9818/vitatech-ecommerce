import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-6 py-24 text-center">
      <span className="text-5xl">✕</span>
      <div className="font-heading text-[26px] font-bold text-white">Pago cancelado</div>
      <p className="text-[14px] text-vt-muted-1">
        No se completó el pago. Tu carrito sigue guardado, puedes intentar de nuevo cuando quieras.
      </p>
      <Link
        href="/carrito"
        className="mt-2 rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-bold text-vt-accent-fg"
      >
        Volver al carrito
      </Link>
    </div>
  );
}
