import { SUPPORT_PHONE_E164 } from "@/lib/site";

// wa.me quiere el número sin "+" ni guiones ni espacios.
const NUMERO = SUPPORT_PHONE_E164.replace(/\D/g, "");

/** Arma el enlace de WhatsApp con el mensaje ya escrito. */
export function whatsappUrl(mensaje: string) {
  return `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

/** El del botón flotante: el visitante todavía no está viendo nada concreto. */
export const MENSAJE_GENERAL = "Hola VITATECH 👋 Quisiera información sobre sus productos.";

/**
 * El de la ficha de producto. Lleva nombre, precio y enlace para que del lado
 * de Angel llegue un mensaje que ya dice qué quiere el cliente: sin esto, el
 * chat empieza con un "hola" y hay que adivinar de qué producto habla.
 */
export function mensajeProducto(opts: { nombre: string; precio: string; url: string }) {
  return `Hola VITATECH 👋 Me interesa este producto:

${opts.nombre} — ${opts.precio}
${opts.url}

¿Está disponible?`;
}
