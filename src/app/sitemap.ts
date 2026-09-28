import type { MetadataRoute } from "next";
import { getSitemapProducts } from "@/lib/catalog";
import { DEPARTMENTS, DEPARTMENT_ORDER } from "@/lib/departments";
import { SITE_URL } from "@/lib/site";

/**
 * Sin esto, Next genera el sitemap UNA vez en build y lo cachea: un producto
 * agregado desde el panel (sin un `git push` de por medio) no aparecería
 * hasta el próximo despliegue de código.
 */
export const dynamic = "force-dynamic";

/**
 * Páginas informativas. Van SIN `lastModified` a propósito: antes llevaban la
 * hora de cada visita, y Google aprende a ignorar un `lastmod` que siempre
 * dice "ahora" — también el de los productos, que sí es real. Solo se declara
 * una fecha cuando se sabe de verdad cuándo cambió la página.
 * (`changeFrequency` y `priority` Google hoy los ignora; se dejan por otros
 * buscadores como Bing, a los que sí les sirven de pista.)
 */
const INFO_ROUTES: { path: string; priority: number }[] = [
  { path: "/tiendas", priority: 0.4 },
  { path: "/envios", priority: 0.4 },
  { path: "/garantias", priority: 0.4 },
  { path: "/soporte", priority: 0.4 },
  { path: "/contacto", priority: 0.5 },
  { path: "/terminos", priority: 0.3 },
];

/**
 * Next escribe las URLs tal cual dentro del XML, sin escapar. Un "&" suelto
 * (por ejemplo en una URL con dos parámetros) haría que Google rechace el
 * sitemap ENTERO por XML inválido.
 */
function xml(url: string) {
  return url.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const masReciente = (fechas: Date[]) =>
  fechas.length ? new Date(Math.max(...fechas.map((f) => f.getTime()))) : undefined;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Next ejecuta esta función una vez durante el build para el manifiesto de
  // rutas, momento en el que DATABASE_URL no existe (el paso de build en
  // Cloudflare no la expone, solo el runtime del Worker). En producción real
  // sí corre por request con el entorno completo; esto solo evita que ese
  // paso de build truene con un error sin capturar.
  const products = await getSitemapProducts().catch(() => []);
  const ultimoCambio = masReciente(products.map((p) => p.updatedAt));

  // Portada y catálogo cambian cuando cambia cualquier producto.
  const principales: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: ultimoCambio, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalogo`, lastModified: ultimoCambio, changeFrequency: "daily", priority: 0.9 },
  ];

  // Departamentos y categorías: cada uno con la misma URL que su página
  // declara como canónica (ver generateMetadata en catalogo/page.tsx). Solo
  // los que tienen productos visibles — anunciarle a Google una página vacía
  // es invitarlo a marcarla como "contenido escaso".
  const departamentos: MetadataRoute.Sitemap = DEPARTMENT_ORDER.flatMap((d) => {
    const suyos = products.filter((p) => p.category.department === d);
    if (suyos.length === 0) return [];
    return [
      {
        url: xml(`${SITE_URL}/catalogo?dept=${DEPARTMENTS[d].slug}`),
        lastModified: masReciente(suyos.map((p) => p.updatedAt)),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
    ];
  });

  const porCategoria = new Map<string, Date[]>();
  for (const p of products) {
    porCategoria.set(p.category.name, [...(porCategoria.get(p.category.name) ?? []), p.updatedAt]);
  }
  const categorias: MetadataRoute.Sitemap = [...porCategoria.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(([nombre, fechas]) => ({
      url: xml(`${SITE_URL}/catalogo?cat=${encodeURIComponent(nombre)}`),
      lastModified: masReciente(fechas),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const info: MetadataRoute.Sitemap = INFO_ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority,
  }));

  // Cada producto lleva sus fotos: así pueden aparecer en Google Imágenes,
  // que para una tienda es una puerta de entrada más.
  const productos: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/producto/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
    images: p.images.filter((src) => /^https?:\/\//.test(src)).map(xml),
  }));

  return [...principales, ...departamentos, ...categorias, ...info, ...productos];
}
