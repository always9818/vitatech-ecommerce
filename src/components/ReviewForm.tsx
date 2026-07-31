"use client";

import { useActionState, useState } from "react";
import type { ReviewFormState } from "@/lib/review-actions";
import { Icon } from "@/components/Icon";

type ExistingReview = { rating: number; comment: string; status: "PENDING" | "APPROVED" | "REJECTED" } | null;

const STATUS_MESSAGE: Record<"PENDING" | "APPROVED" | "REJECTED", string> = {
  PENDING: "Tu reseña está pendiente de aprobación. Puedes editarla:",
  APPROVED: "Ya tienes una reseña publicada. Si la editas, volverá a quedar pendiente de aprobación:",
  REJECTED: "Tu reseña anterior no fue aprobada. Puedes intentar de nuevo:",
};

export function ReviewForm({
  action,
  isLoggedIn,
  existingReview,
}: {
  action: (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
  isLoggedIn: boolean;
  existingReview: ExistingReview;
}) {
  const [state, formAction, isPending] = useActionState<ReviewFormState, FormData>(action, {});
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hover, setHover] = useState(0);

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3 text-[13px] text-vt-muted-1">
        <a href="/login" className="font-bold text-vt-accent">
          Inicia sesión
        </a>{" "}
        para dejar tu reseña de este producto.
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="rounded-2xl border border-vt-accent/30 bg-vt-accent/10 px-4 py-3 text-[13px] font-semibold text-vt-accent">
        ¡Gracias! Tu reseña fue enviada y quedó pendiente de aprobación.
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl border border-white/10 p-4">
      {existingReview && (
        <div className="mb-3 text-[12px] font-semibold text-vt-muted-2">
          {STATUS_MESSAGE[existingReview.status]}
        </div>
      )}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          const active = value <= (hover || rating);
          return (
            <button
              key={i}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${value} estrellas`}
              className="vt-btn text-vt-accent"
            >
              <Icon name="star" filled={active} className={active ? "h-6 w-6" : "h-6 w-6 text-vt-muted-3"} />
            </button>
          );
        })}
      </div>
      <input type="hidden" name="rating" value={rating} />
      <textarea
        name="comment"
        required
        defaultValue={existingReview?.comment ?? ""}
        placeholder="Cuéntanos tu experiencia con este producto..."
        rows={3}
        className="mt-3 w-full rounded-lg border border-white/10 bg-white/[.05] px-3 py-2 text-[13px] text-vt-fg placeholder:text-vt-muted-2 focus:border-vt-accent/50 focus:outline-none"
      />
      {state.error && <div className="mt-2 text-[12.5px] text-vt-error">{state.error}</div>}
      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="vt-btn vt-btn-accent mt-3 rounded-[10px] bg-vt-accent px-5 py-2.5 text-[13px] font-bold text-vt-accent-fg disabled:opacity-50"
      >
        {isPending ? "Enviando..." : existingReview ? "Actualizar reseña" : "Enviar reseña"}
      </button>
    </form>
  );
}
