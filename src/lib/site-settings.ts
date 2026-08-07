import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_SEGUNDOS, TAG_PORTADA } from "@/lib/cache-tags";

// Se seleccionan los campos a mano en vez de traer la fila entera: `updatedAt`
// es un `DateTime` y la caché guarda JSON, así que volvería convertido en texto
// aunque TypeScript siguiera diciendo `Date`. Nadie lo usa, así que la forma
// más segura es no traerlo.
export const getSiteSettings = unstable_cache(
  async () =>
    prisma.siteSettings.findUnique({
      where: { id: "main" },
      select: {
        id: true,
        heroImageUrl: true,
        heroBadge: true,
        heroTitle: true,
        heroTitleAccent: true,
        heroSubtitle: true,
      },
    }),
  ["ajustes-sitio"],
  { tags: [TAG_PORTADA], revalidate: CACHE_SEGUNDOS },
);

// Textos del hero de la home. Se usan cuando el campo correspondiente vale
// null, es decir mientras nadie lo haya personalizado desde /admin/portada —
// incluido el caso de darle "Restablecer": ahí es a donde vuelve.
//
// Hablan de los DOS departamentos (Tecnología y Salud y Bienestar) a
// propósito: antes solo mencionaban tecnología, cuando VITATECH siempre fue
// literal — VITA por vitaminas y suplementos, TECH por tecnología.
export const HERO_DEFAULTS = {
  badge: "TECNOLOGÍA Y BIENESTAR",
  title: "Todo lo que tu día",
  titleAccent: "necesita",
  subtitle:
    "Tecnología original y suplementos de marcas confiables, con envío a todo Guatemala y garantía real.",
} as const;

export type HeroContent = {
  badge: string;
  title: string;
  titleAccent: string;
  subtitle: string;
};

type HeroFields = {
  heroBadge?: string | null;
  heroTitle?: string | null;
  heroTitleAccent?: string | null;
  heroSubtitle?: string | null;
};

// null significa "nunca se personalizó" y cae al valor por defecto; la cadena
// vacía es una elección deliberada del administrador y significa "ocultar".
// Por eso se usa `??` y no `||` en todos los campos menos el título, que no
// puede quedar vacío sin dejar la home sin encabezado.
export function resolveHeroContent(settings: HeroFields | null): HeroContent {
  return {
    badge: settings?.heroBadge ?? HERO_DEFAULTS.badge,
    title: settings?.heroTitle?.trim() || HERO_DEFAULTS.title,
    titleAccent: settings?.heroTitleAccent ?? HERO_DEFAULTS.titleAccent,
    subtitle: settings?.heroSubtitle ?? HERO_DEFAULTS.subtitle,
  };
}
