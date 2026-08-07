"use client";

import { Icon } from "@/components/Icon";
import { trackWhatsAppContact } from "@/lib/tracking";

/**
 * Enlace a WhatsApp con el mensaje ya escrito.
 *
 * Es cliente solo por el evento de conversión: sin él bastaría un `<a>` y no
 * habría forma de saber cuánta gente escribe desde la tienda. `target="_blank"`
 * porque en escritorio abre WhatsApp Web y no queremos sacar al cliente de la
 * página que estaba viendo.
 */
function EnlaceWhatsApp({
  href,
  origen,
  className,
  children,
  ...rest
}: {
  href: string;
  origen: "flotante" | "ficha-producto";
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<"a">, "href" | "className" | "children" | "onClick">) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppContact(origen)}
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}

/**
 * Botón flotante, presente en todas las páginas.
 *
 * Va en el acento lima de la marca y no en el verde de WhatsApp: el ícono y la
 * palabra ya lo hacen inconfundible, y así no se mete un color ajeno a la
 * paleta. En móvil se queda solo el ícono para no tapar el contenido.
 */
export function WhatsAppFab({ href }: { href: string }) {
  return (
    <EnlaceWhatsApp
      href={href}
      origen="flotante"
      aria-label="Escribirnos por WhatsApp"
      // z-40 y no z-50: el aviso emergente (ToastProvider) va en z-50 y debe
      // quedar por encima cuando aparecen los dos a la vez.
      className="vt-btn vt-btn-accent fixed right-5 bottom-5 z-40 flex items-center gap-2.5 rounded-full bg-vt-accent px-4 py-3.5 text-sm font-bold text-vt-accent-fg shadow-[0_12px_30px_rgba(0,0,0,.45)]"
    >
      <Icon name="whatsapp" className="h-6 w-6" />
      <span className="hidden min-[520px]:inline">WhatsApp</span>
    </EnlaceWhatsApp>
  );
}

/** Botón de la ficha de producto, con el producto ya escrito en el mensaje. */
export function WhatsAppProducto({ href }: { href: string }) {
  return (
    <EnlaceWhatsApp
      href={href}
      origen="ficha-producto"
      className="vt-btn flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-white/25 px-6 py-3.5 text-sm font-bold text-white hover:border-vt-accent hover:text-vt-accent"
    >
      <Icon name="whatsapp" className="h-[18px] w-[18px]" />
      Preguntar por WhatsApp
    </EnlaceWhatsApp>
  );
}
