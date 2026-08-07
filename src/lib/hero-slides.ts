import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_SEGUNDOS, TAG_PORTADA } from "@/lib/cache-tags";

export type HeroSlideView = {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  alt: string | null;
};

/** Diapositivas del carrusel de la portada, en el orden configurado. */
export const getHeroSlides = unstable_cache(
  async (): Promise<HeroSlideView[]> =>
    prisma.heroSlide.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, imageUrl: true, linkUrl: true, alt: true },
    }),
  ["diapositivas-portada"],
  { tags: [TAG_PORTADA], revalidate: CACHE_SEGUNDOS },
);
