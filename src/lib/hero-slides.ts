import { prisma } from "@/lib/prisma";

export type HeroSlideView = {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  alt: string | null;
};

/** Diapositivas del carrusel de la portada, en el orden configurado. */
export async function getHeroSlides(): Promise<HeroSlideView[]> {
  return prisma.heroSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, imageUrl: true, linkUrl: true, alt: true },
  });
}
