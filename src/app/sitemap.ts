import type { MetadataRoute } from "next";
import { getSitemapProducts } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

/**
 * Sin esto, Next genera el sitemap UNA vez en build y lo cachea: un producto
 * agregado desde el panel (sin un `git push` de por medio) no aparecería
 * hasta el próximo despliegue de código.
 */
export const dynamic = "force-dynamic";

const STATIC_ROUTES: { path: string; changeFrequency: "daily" | "weekly" | "monthly"; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/catalogo", changeFrequency: "daily", priority: 0.9 },
  { path: "/tiendas", changeFrequency: "monthly", priority: 0.4 },
  { path: "/envios", changeFrequency: "monthly", priority: 0.4 },
  { path: "/garantias", changeFrequency: "monthly", priority: 0.4 },
  { path: "/soporte", changeFrequency: "monthly", priority: 0.4 },
  { path: "/terminos", changeFrequency: "monthly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Next ejecuta esta función una vez durante el build para el manifiesto de
  // rutas, momento en el que DATABASE_URL no existe (el paso de build en
  // Cloudflare no la expone, solo el runtime del Worker). En producción real
  // sí corre por request con el entorno completo; esto solo evita que ese
  // paso de build truene con un error sin capturar.
  const products = await getSitemapProducts().catch(() => []);
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const productEntries = products.map((p) => ({
    url: `${SITE_URL}/producto/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries];
}
