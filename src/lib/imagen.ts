import { SITE_URL } from "@/lib/site";

/**
 * Sirve las fotos redimensionadas por Cloudflare en vez de mandarlas a tamaño
 * completo.
 *
 * El problema medido en la portada el 2026-08-27: la foto del Fire TV Stick
 * pesa 1600x1600 reales y se dibuja en un hueco de 269x170 — 35 veces mas
 * pixeles de los que hacen falta. El banner del carrusel, 1600x700 para
 * mostrarse a 727x409. Ninguna imagen llevaba `srcset`, asi que el navegador
 * no tenia forma de pedir una version mas chica.
 *
 * Cloudflare transforma al vuelo cualquier imagen con la ruta
 * `/cdn-cgi/image/<opciones>/<url>`, y acepta una url de otro origen (las
 * fotos viven en el bucket publico `pub-*.r2.dev`) siempre que la zona tenga
 * activado "Resize images from any origin". La transformacion se sirve desde
 * NUESTRO dominio, asi que de paso las fotos dejan de venir de un host ajeno.
 *
 * PARA ACTIVARLO hacen falta dos cosas, en este orden:
 *   1. En el panel de Cloudflare: Speed -> Optimization -> Image
 *      Transformations -> habilitar, incluyendo "Resize images from any
 *      origin". Esto solo lo puede hacer Angel: el token de wrangler no
 *      llega ahi.
 *   2. Poner IMAGENES_OPTIMIZADAS en "1" (en wrangler.jsonc o como variable
 *      en el panel del Worker).
 *
 * Mientras el interruptor este apagado, `foto()` devuelve la url intacta y
 * `fotoSrcSet()` devuelve undefined: la tienda se comporta exactamente igual
 * que antes. Es a proposito — activar las transformaciones sin el paso 1
 * daria 404 en todas las fotos.
 */

/**
 * Se lee DENTRO de la funcion, nunca al evaluar el modulo: en Cloudflare
 * Workers las variables de entorno solo existen durante un request (mismo
 * motivo por el que `src/lib/prisma.ts` crea el cliente de forma perezosa).
 */
function transformacionesActivas() {
  return process.env.IMAGENES_OPTIMIZADAS === "1";
}

/**
 * `fit=scale-down` y no `contain`: hay fotos cuyo original ya es chico
 * (300x300 en varios productos) y `contain` las estiraria hasta el ancho
 * pedido, gastando bytes en agrandar algo borroso. `scale-down` solo achica.
 *
 * `format=auto` entrega AVIF o WebP segun lo que acepte el navegador, y cae a
 * JPEG/PNG en los que no.
 */
export function foto(url: string | undefined, ancho: number): string | undefined {
  if (!url || !transformacionesActivas()) return url;
  // Solo urls absolutas: una ruta local (`/icon.svg`) ya la sirve el Worker.
  if (!/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}/cdn-cgi/image/width=${ancho},format=auto,fit=scale-down/${url}`;
}

/**
 * Devuelve `undefined` con el interruptor apagado a proposito: un `srcset`
 * cuyas variantes apuntan todas a la misma url no ahorra nada y confunde al
 * navegador, que elegiria la "mas grande" creyendo que son distintas.
 */
export function fotoSrcSet(url: string | undefined, anchos: number[]): string | undefined {
  if (!url || !transformacionesActivas()) return undefined;
  return anchos.map((a) => `${foto(url, a)} ${a}w`).join(", ");
}

/** Anchos de las tarjetas de producto: se dibujan a 269x170 en escritorio. */
export const ANCHOS_TARJETA = [320, 480, 640];

/** Anchos del banner: se dibuja a 727x409 en escritorio. */
export const ANCHOS_BANNER = [640, 960, 1280];
