import { auth } from "@/auth";
import { createReview, getMyReviewForProduct } from "@/lib/review-actions";
import { getApprovedReviews } from "@/lib/reviews";
import { Icon } from "@/components/Icon";
import { ReviewForm } from "@/components/ReviewForm";

export async function ReviewsSection({ productId }: { productId: string }) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const [reviews, myReview] = await Promise.all([
    getApprovedReviews(productId),
    isLoggedIn ? getMyReviewForProduct(productId) : Promise.resolve(null),
  ]);

  return (
    <div className="mt-10">
      <h2 className="font-heading text-xl font-bold text-white">Reseñas de clientes</h2>

      <div className="mt-5">
        <ReviewForm
          action={createReview.bind(null, productId)}
          isLoggedIn={isLoggedIn}
          existingReview={myReview}
        />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {reviews.length === 0 && (
          <p className="text-[13.5px] text-vt-muted-2">Todavía no hay reseñas aprobadas para este producto.</p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13.5px] font-semibold text-vt-fg">{r.autor}</span>
              <span className="flex items-center gap-0.5 text-vt-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    filled={i < r.rating}
                    className={i < r.rating ? "h-3.5 w-3.5" : "h-3.5 w-3.5 text-vt-muted-3"}
                  />
                ))}
              </span>
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-vt-muted-1">{r.comment}</p>
            {/* Ya viene formateada desde `reviews.ts`: al pasar por la caché,
                un `Date` volvería como texto y `toLocaleDateString` reventaría
                la ficha entera. */}
            <p className="mt-2 text-[11px] text-vt-muted-3">{r.fechaTexto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
