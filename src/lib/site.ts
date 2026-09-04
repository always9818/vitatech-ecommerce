import type { Metadata } from "next";

/** Constantes de marca reutilizadas por metadata, sitemap, robots y JSON-LD. */
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const SITE_NAME = "VITATECH";
// El nombre siempre fue literal: VITA por vitaminas y suplementos, TECH por
// tecnología. Hasta el 2026-08-07 el sitio solo anunciaba lo segundo.
export const SITE_TITLE = "VITATECH_ · Tecnología y suplementos";
export const SITE_DESCRIPTION =
  "Tecnología original y suplementos de marcas confiables, con envío a todo Guatemala y garantía real.";
export const SUPPORT_PHONE_E164 = "+50253353561";
export const SUPPORT_EMAIL = "info@importadoravitatech.com";

/**
 * `openGraph.title`/`description` NO heredan el `title`/`description` de la
 * página ni el template del layout raíz: si una página solo define `title`,
 * el link compartido en WhatsApp muestra igual el título genérico del home.
 * Este helper arma los tres (title tag, OG y Twitter) desde un solo lugar.
 */
export function pageMetadata(opts: { title: string; description: string; path: string; image?: string }): Metadata {
  const { title, description, path, image } = opts;
  const fullTitle = `${title} · ${SITE_NAME}`;
  // Next solo aplica el respaldo automático de opengraph-image.png cuando la
  // página NO define su propio `openGraph`. En cuanto una página trae el suyo
  // (como aquí, para tener título/descripción propios), ese respaldo deja de
  // aplicarse aunque no se incluya `images` — hay que poner la imagen a mano.
  const images = [image ?? `${SITE_URL}/opengraph-image.png`];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, images },
    twitter: { title: fullTitle, description, images },
  };
}
