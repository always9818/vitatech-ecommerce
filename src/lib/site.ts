import type { Metadata } from "next";

/** Constantes de marca reutilizadas por metadata, sitemap, robots y JSON-LD. */
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const SITE_NAME = "VITATECH";
export const SITE_TITLE = "VITATECH_ · Importadora de tecnología";
export const SITE_DESCRIPTION =
  "Potencia tu setup al mejor precio. Accesorios, celulares, monitores, audio y más, con envío a todo Guatemala.";
export const SUPPORT_PHONE_E164 = "+50253353561";
export const SUPPORT_EMAIL = "info@importacionesvitatech.com";

/**
 * `openGraph.title`/`description` NO heredan el `title`/`description` de la
 * página ni el template del layout raíz: si una página solo define `title`,
 * el link compartido en WhatsApp muestra igual el título genérico del home.
 * Este helper arma los tres (title tag, OG y Twitter) desde un solo lugar.
 */
export function pageMetadata(opts: { title: string; description: string; path: string; image?: string }): Metadata {
  const { title, description, path, image } = opts;
  const fullTitle = `${title} · ${SITE_NAME}`;
  const images = image ? [image] : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, images },
    twitter: { title: fullTitle, description, images },
  };
}
