import { Icon } from "@/components/Icon";
import { money } from "@/lib/money";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";

/**
 * Empuja el ticket promedio: le muestra al cliente qué tan cerca está del
 * envío gratis y cuánto le falta. `FREE_SHIPPING_THRESHOLD` ya existía en
 * `shipping.ts` para calcular el costo real del envío, pero nada en la
 * interfaz lo usaba para animar al cliente a llegar a él.
 */
export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const falta = FREE_SHIPPING_THRESHOLD - subtotal;
  const alcanzado = falta <= 0;
  const progreso = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-vt-fg">
        <span className={alcanzado ? "text-vt-accent" : "text-vt-muted-1"}>
          <Icon name="truck" className="h-[18px] w-[18px]" />
        </span>
        {alcanzado ? (
          <span>Tu pedido ya tiene envío gratis</span>
        ) : (
          <span>
            Te faltan <span className="text-vt-accent">{money(falta)}</span> para envío gratis
          </span>
        )}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-vt-accent transition-[width] duration-500"
          style={{ width: `${progreso}%` }}
        />
      </div>
    </div>
  );
}
