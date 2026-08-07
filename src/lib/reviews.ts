import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_SEGUNDOS, TAG_RESENAS } from "@/lib/cache-tags";

/**
 * Lecturas públicas de reseñas, cacheadas.
 *
 * Viven aquí y no en `review-actions.ts` porque ese archivo es `"use server"`:
 * todo lo que exporta queda expuesto como Server Action, y estas son consultas
 * de render, no acciones que alguien deba poder invocar desde el navegador.
 *
 * La tabla `Review` solo existe después de `prisma db push`. Mientras no se
 * haya aplicado, estas consultas revientan y se llevarían consigo la ficha de
 * producto entera, así que se degradan a "sin reseñas" y dejan el error en los
 * logs (`wrangler tail`) en vez de tumbar la página.
 */
function alFallar<T>(contexto: string, respaldo: T) {
  return (err: unknown): T => {
    console.error("[reviews] %s falló (¿falta `prisma db push`?): %o", contexto, err);
    return respaldo;
  };
}

export type ResenaPublica = {
  id: string;
  rating: number;
  comment: string;
  autor: string;
  /** Ya formateada aquí a propósito — ver abajo. */
  fechaTexto: string;
};

/**
 * La fecha sale de esta función como TEXTO, no como `Date`.
 *
 * La caché guarda JSON: un `Date` vuelve convertido en cadena aunque
 * TypeScript siga jurando que es `Date`. La plantilla llamaba
 * `createdAt.toLocaleDateString(...)` y eso habría reventado la ficha de
 * producto entera en cuanto la respuesta viniera de la caché — un fallo que
 * además no se ve en la primera carga, solo en la segunda.
 */
const leerAprobadas = unstable_cache(
  async (productId: string): Promise<ResenaPublica[]> => {
    const filas = await prisma.review
      .findMany({
        where: { productId, status: "APPROVED" },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      })
      .catch(alFallar("getApprovedReviews", []));

    return filas.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      autor: r.user.name ?? "Cliente",
      fechaTexto: r.createdAt.toLocaleDateString("es-GT", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));
  },
  ["resenas-aprobadas"],
  { tags: [TAG_RESENAS], revalidate: CACHE_SEGUNDOS },
);

export async function getApprovedReviews(productId: string) {
  return leerAprobadas(productId);
}

/**
 * Promedio y total de reseñas aprobadas.
 *
 * Antes caía en `product.rating`/`product.reviews` cuando no había reseñas
 * aprobadas reales — esos campos eran datos de ejemplo (ej. "5.0 · 4 reseñas"
 * en un producto que nunca recibió una reseña real), y se publicaban tal cual
 * en los datos estructurados que lee Google. Sin reseñas reales es 0 sin
 * relleno: es lo honesto, y evita que Google marque el sitio por reseñas
 * falsas.
 */
const leerEstadisticas = unstable_cache(
  async (productId: string) => {
    const approved = await prisma.review
      .aggregate({
        where: { productId, status: "APPROVED" },
        _avg: { rating: true },
        _count: { _all: true },
      })
      .catch(alFallar("getProductRatingStats", null));

    if (!approved || approved._count._all === 0) {
      return { rating: 0, reviews: 0 };
    }

    return { rating: approved._avg.rating ?? 0, reviews: approved._count._all };
  },
  ["estadisticas-resenas"],
  { tags: [TAG_RESENAS], revalidate: CACHE_SEGUNDOS },
);

export async function getProductRatingStats(productId: string) {
  return leerEstadisticas(productId);
}
