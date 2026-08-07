/**
 * Etiquetas de caché de la tienda.
 *
 * Cada lectura del catálogo se guarda en caché marcada con una de estas
 * etiquetas; cuando algo cambia (el panel guarda un producto, una compra
 * descuenta stock) se llama `revalidateTag` con la misma etiqueta y esa caché
 * se descarta al instante. Sin esto, un cambio tardaría hasta
 * `CACHE_SEGUNDOS` en verse.
 *
 * Viven en su propio archivo — y no dentro de `catalog.ts` — porque quien las
 * invalida son los Server Actions del panel (`admin-actions.ts`,
 * `hero-slide-actions.ts`) y el webhook de pagos. Importar `catalog.ts` desde
 * ahí solo para leer una constante arrastraría toda la capa de consultas a
 * módulos que no la necesitan.
 */

/** Todo lo que la tienda muestra del catálogo: productos, categorías y marcas. */
export const TAG_CATALOGO = "catalogo";

/** Textos y diapositivas de la portada (lo editable desde /admin/portada). */
export const TAG_PORTADA = "portada";

/**
 * Red de seguridad: aunque una invalidación por etiqueta fallara, ninguna caché
 * vive más de 5 minutos. Es corto a propósito — lo que se cachea incluye el
 * stock que se muestra en pantalla, y aunque vender de más es imposible (el
 * carrito y el checkout siempre releen el stock real de la base, ver
 * `cart-actions.ts` y `checkout-actions.ts`), sí queremos que un "Agotado"
 * aparezca pronto.
 */
export const CACHE_SEGUNDOS = 300;
