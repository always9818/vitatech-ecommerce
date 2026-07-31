"use client";

import { useTransition } from "react";
import { approveReview, rejectReview, deleteReview } from "@/lib/admin-actions";

export function ReviewModerationActions({
  reviewId,
  status,
}: {
  reviewId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      {status !== "APPROVED" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => approveReview(reviewId))}
          className="font-bold text-vt-accent disabled:opacity-50"
        >
          Aprobar
        </button>
      )}
      {status !== "REJECTED" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => rejectReview(reviewId))}
          className="font-bold text-vt-warning disabled:opacity-50"
        >
          Rechazar
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm("¿Eliminar esta reseña? Esta acción no se puede deshacer.")) return;
          startTransition(() => deleteReview(reviewId));
        }}
        className="font-bold text-vt-error disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  );
}
