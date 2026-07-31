import Link from "next/link";
import { Icon } from "@/components/Icon";

/**
 * Ya no dispara el pago directamente: primero pasa por /checkout para pedir la
 * dirección de entrega. Sin ella no hay a dónde enviar el pedido.
 */
export function CheckoutButton() {
  return (
    <Link
      href="/checkout"
      className="vt-btn vt-btn-accent flex w-full items-center justify-center gap-2 rounded-[10px] bg-vt-accent py-3.5 text-[15px] font-extrabold text-vt-accent-fg"
    >
      <Icon name="card" className="h-[18px] w-[18px]" />
      Finalizar compra
    </Link>
  );
}
