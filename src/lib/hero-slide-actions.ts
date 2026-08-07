"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { uploadSiteImage } from "@/lib/r2";
import { TAG_PORTADA } from "@/lib/cache-tags";

export type HeroSlideFormState = { error?: string; ok?: boolean };

function refresh() {
  // La etiqueta es lo que de verdad tira la caché del carrusel; los
  // `revalidatePath` solo refrescan la navegación del cliente.
  updateTag(TAG_PORTADA);
  revalidatePath("/admin/portada");
  revalidatePath("/");
}

/** Agrega un diseño nuevo al final del carrusel. */
export async function addHeroSlide(
  _prevState: HeroSlideFormState,
  formData: FormData
): Promise<HeroSlideFormState> {
  await requireAdmin();

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen." };
  }

  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();

  // Solo rutas internas: un enlace externo aquí sería una puerta abierta para
  // mandar a los clientes fuera del sitio desde un banner.
  if (linkUrl && !linkUrl.startsWith("/")) {
    return { error: "El enlace debe empezar con / (por ejemplo /catalogo?cat=Laptops)." };
  }

  try {
    const url = await uploadSiteImage(file);
    const last = await prisma.heroSlide.findFirst({ orderBy: { sortOrder: "desc" } });
    await prisma.heroSlide.create({
      data: {
        imageUrl: url,
        linkUrl: linkUrl || null,
        alt: alt || null,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo agregar el diseño." };
  }

  refresh();
  return { ok: true };
}

/**
 * Cambia a dónde lleva un diseño ya subido. Antes el enlace solo se podía poner
 * al crearlo: para agregárselo a uno existente había que borrarlo y volver a
 * subir la imagen.
 */
export async function updateHeroSlideLink(slideId: string, linkUrl: string) {
  await requireAdmin();

  const limpio = linkUrl.trim();
  if (limpio && !limpio.startsWith("/")) return;

  await prisma.heroSlide.update({
    where: { id: slideId },
    data: { linkUrl: limpio || null },
  });

  refresh();
}

export async function deleteHeroSlide(slideId: string) {
  await requireAdmin();
  await prisma.heroSlide.delete({ where: { id: slideId } });
  refresh();
}

/** Mueve un diseño una posición arriba o abajo, intercambiándolo con su vecino. */
export async function moveHeroSlide(slideId: string, direction: "up" | "down") {
  await requireAdmin();

  const slides = await prisma.heroSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  const i = slides.findIndex((s) => s.id === slideId);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i === -1 || j < 0 || j >= slides.length) return;

  [slides[i], slides[j]] = [slides[j], slides[i]];

  // Se reescriben todos los órdenes: es barato (son pocas diapositivas) y deja
  // la numeración limpia aunque hubiera huecos o empates previos.
  await prisma.$transaction(
    slides.map((s, index) =>
      prisma.heroSlide.update({ where: { id: s.id }, data: { sortOrder: index } })
    )
  );

  refresh();
}
