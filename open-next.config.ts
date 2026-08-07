import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import d1TagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/**
 * Sin estos dos overrides, OpenNext usa `"dummy"` para ambos: es decir, NADA se
 * cachea entre requests y cada visita vuelve a consultar la base. Eso era lo que
 * hacía que la portada tardara ~1.4s incluso en caliente, y lo que dejaba al
 * primer visitante del día viendo el error de la base dormida.
 *
 * - `incrementalCache` (R2, bucket `vitatech-next-cache`): guarda el resultado
 *   de los `unstable_cache` de `src/lib/catalog.ts`. Es un bucket PRIVADO y
 *   aparte del de las fotos (`vitatech-product-images`, que es público): aquí no
 *   debe poder mirar nadie desde fuera.
 * - `tagCache` (D1, base `vitatech-next-tags`): registra qué etiquetas se
 *   invalidaron. Es lo que hace que `revalidateTag(...)` del panel de
 *   administración se note de inmediato en la tienda. Se eligió D1 y no KV
 *   porque KV es consistente "al final" y tarda hasta 60s en propagar: Angel
 *   sube un producto y quiere verlo ya, no dentro de un minuto.
 *
 * La tabla `revalidations` de D1 ya está creada (ver docs/MANUAL-ADMIN.md).
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: d1TagCache,
});
