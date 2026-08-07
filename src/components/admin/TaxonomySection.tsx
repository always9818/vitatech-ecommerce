"use client";

import { useActionState, useTransition } from "react";
import type { TaxonomyFormState } from "@/lib/admin-actions";

type Item = { id: string; name: string; productCount: number; groupLabel?: string };

export function TaxonomySection({
  title,
  items,
  createAction,
  deleteAction,
  placeholder,
  // Solo las categorías lo usan: una marca no pertenece a un departamento
  // (Xiaomi vende celulares, y una marca de suplementos podría vender de todo).
  groupOptions,
  groupLabel,
  groupHelp,
}: {
  title: string;
  items: Item[];
  createAction: (state: TaxonomyFormState, formData: FormData) => Promise<TaxonomyFormState>;
  deleteAction: (id: string) => Promise<void>;
  placeholder: string;
  groupOptions?: { value: string; label: string }[];
  groupLabel?: string;
  groupHelp?: string;
}) {
  const [state, formAction, isPending] = useActionState<TaxonomyFormState, FormData>(createAction, {});
  const [isDeleting, startDeleteTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-white/10 p-6">
      <h2 className="font-heading text-lg font-bold text-white">{title}</h2>

      <form action={formAction} className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            name="name"
            required
            placeholder={placeholder}
            className="flex-1 rounded-[10px] border border-white/10 bg-white/[.05] px-4 py-2.5 text-sm text-vt-fg placeholder:text-vt-muted-2 focus:border-vt-accent/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="vt-btn vt-btn-accent rounded-[10px] bg-vt-accent px-5 py-2.5 text-sm font-bold text-vt-accent-fg"
          >
            {isPending ? "..." : "Agregar"}
          </button>
        </div>

        {groupOptions && (
          <>
            <label className="mt-1 text-[12.5px] font-semibold text-vt-fg">{groupLabel}</label>
            <select
              name="department"
              defaultValue={groupOptions[0]?.value}
              className="rounded-[10px] border border-white/10 bg-white/[.05] px-4 py-2.5 text-sm text-vt-fg focus:border-vt-accent/50 focus:outline-none"
            >
              {groupOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-vt-bg text-vt-fg">
                  {o.label}
                </option>
              ))}
            </select>
            {groupHelp && <p className="text-[12px] text-vt-muted-2">{groupHelp}</p>}
          </>
        )}
      </form>

      {state.error && <div className="mt-2 text-[12.5px] text-vt-error">{state.error}</div>}

      <ul className="mt-5 flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg bg-white/[.03] px-4 py-2.5 text-[13.5px]"
          >
            <span className="text-vt-fg">
              {item.name}{" "}
              <span className="text-vt-muted-2">
                · {item.productCount} {item.productCount === 1 ? "producto" : "productos"}
                {item.groupLabel ? ` · ${item.groupLabel}` : ""}
              </span>
            </span>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => {
                if (!confirm(`¿Eliminar "${item.name}"?`)) return;
                startDeleteTransition(() => deleteAction(item.id));
              }}
              className="font-bold text-vt-error disabled:opacity-50"
            >
              Eliminar
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-[13px] text-vt-muted-2">Todavía no hay ninguna.</li>
        )}
      </ul>
    </div>
  );
}
