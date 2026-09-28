import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Dinámico a propósito, igual que el sitemap. Siendo estático, Next lo
 * generaba en el build de CI, donde NEXT_PUBLIC_APP_URL no existe, y quedaba
 * congelado como "Sitemap: http://localhost:3000/sitemap.xml" (así estuvo en
 * producción hasta el 2026-09-28): Google no podía encontrar el sitemap solo.
 */
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/cuenta", "/checkout"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
