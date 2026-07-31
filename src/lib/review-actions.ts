"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ReviewFormState = { error?: string; success?: boolean };

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

  await prisma.review.upsert({
    where: { productId_userId: { productId, userId: session.user.id } },
    update: { rating, comment, status: "PENDING" },
    create: { productId, userId: session.user.id, rating, comment, status: "PENDING" },
  });

  revalidatePath(`/producto/${productId}`);
  return { success: true };
}

export async function getApprovedReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductRatingStats(productId: string, fallback: { rating: number; reviews: number }) {
  const approved = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });

  if (approved._count._all === 0) {
    return fallback;
  }

  return { rating: approved._avg.rating ?? 0, reviews: approved._count._all };
}

export async function getMyReviewForProduct(productId: string) {
  const session = await auth();
  if (!session?.user) return null;
  return prisma.review.findUnique({
    where: { productId_userId: { productId, userId: session.user.id } },
  });
}
