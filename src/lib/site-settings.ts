import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  return prisma.siteSettings.findUnique({ where: { id: "main" } });
}

// Textos del hero de la home tal como estaban escritos en el código antes de
// hacerlos editables. Se usan cuando el campo correspondiente vale null, es
// decir mientras nadie los haya personalizado desde /admin/portada.
export const HERO_DEFAULTS = {
  badge: "TEMPORADA TECH · HASTA -40%",
  title: "Potencia tu setup al mejor",
  titleAccent: "precio",
  subtitle:
    "Tecnología de las mejores marcas, con envío a todo Guatemala y garantía real. Encuentra laptops, celulares, monitores y más al mejor precio.",
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
