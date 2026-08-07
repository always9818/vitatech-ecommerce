"use server";

import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TAG_RESENAS } from "@/lib/cache-tags";

export type ReviewFormState = { error?: string; success?: boolean };

// La tabla `Review` solo existe después de correr `prisma db push`. Mientras no
// se haya aplicado el esquema, estas consultas revientan y se llevarían consigo
// la ficha de producto entera. Se degrada a "sin reseñas" y se registra el
// error en los logs (wrangler tail) en vez de tumbar la página.
function onReviewQueryError<T>(context: string, fallback: T) {
  return (err: unknown): T => {
    console.error("[reviews] %s falló (¿falta `prisma db push`?): %o", context, err);
    return fallback;
  };
}

export async function createReview(
  productId: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Debes iniciar sesión para dejar una reseña." };
  }

  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Elige una calificación de 1 a 5 estrellas." };
  }
  if (!comment) {
    return { error: "Escribe un comentario para tu reseña." };
  }
  if (comment.length > 1000) {
    return { error: "El comentario no puede tener más de 1000 caracteres." };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return { error: "El producto ya no existe." };
  }

  try {
    await prisma.review.upsert({
      where: { productId_userId: { productId, userId: session.user.id } },
      update: { rating, comment, status: "PENDING" },
      create: { productId, userId: session.user.id, rating, comment, status: "PENDING" },
    });
  } catch (err) {
    console.error("[reviews] createReview falló (¿falta `prisma db push`?): %o", err);
    return { error: "No se pudo guardar tu reseña en este momento. Intenta más tarde." };
  }

  // Editar una reseña ya aprobada la devuelve a PENDING (el `upsert` de arriba
  // fija `status: "PENDING"` también al actualizar), así que esto sí cambia la
  // lista pública: hay que descartar la caché de reseñas.
  updateTag(TAG_RESENAS);
  revalidatePath(`/producto/${productId}`);
  return { success: true };
}

// Las lecturas públicas (reseñas aprobadas y promedio de estrellas) se mudaron
// a `src/lib/reviews.ts`, donde están cacheadas: aquí quedarían expuestas como
// Server Actions sin necesidad, y este archivo es solo para lo que escribe.

export async function getMyReviewForProduct(productId: string) {
  const session = await auth();
  if (!session?.user) return null;
  return prisma.review
    .findUnique({
      where: { productId_userId: { productId, userId: session.user.id } },
    })
    .catch(onReviewQueryError("getMyReviewForProduct", null));
}
