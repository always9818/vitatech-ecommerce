"use client";

import { useState, useTransition } from "react";
import type { ProductFormState } from "@/lib/admin-actions";
import { PRODUCT_ICON_OPTIONS } from "@/lib/product-icon";

type Option = { id: string; name: string };

type ProductFormProps = {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: Option[];
  brands: Option[];
  submitLabel: string;
  defaultValues?: {
    name: string;
    sku: string;
    description: string;
    icon: string;
    categoryId: string;
    brandId: string;
    price: number;
    oldPrice: number;
    stock: number;
    specsText: string;
    existingImage?: string;
  };
};

const inputClass =
  "w-full rounded-[10px] border border-white/10 bg-white/[.05] px-4 py-2.5 text-sm text-vt-fg placeholder:text-vt-muted-2 focus:border-vt-accent/50 focus:outline-none";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-vt-fg";

export function ProductForm({ action, categories, brands, submitLabel, defaultValues }: ProductFormProps) {
  const [state, setState] = useState<ProductFormState>({});
  const [isPending, startTransition] = useTransition();
  const [removeImage, setRemoveImage] = useState(false);

  const v = defaultValues;

  return (
    <form
      // Envío manual en vez de `<form action={...}>`: React 19 reinicia los
      // campos no controlados al terminar una acción de formulario, y eso
      // borraba todo el producto ya tecleado cuando algo fallaba (por ejemplo
      // un SKU repetido). Peor aún en los <select>, que al reiniciarse saltaban
      // a la primera opción válida y cambiaban la categoría en silencio.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          setState(await action({}, formData));
        });
      }}
      className="mt-6 grid grid-cols-1 gap-6 min-[880px]:grid-cols-2"
    >
      <div>
        <label className={labelClass}>Nombre del producto</label>
        <input name="name" required defaultValue={v?.name} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>SKU</label>
        <input name="sku" required defaultValue={v?.sku} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Categoría</label>
        <select
          name="categoryId"
          required
          defaultValue={v?.categoryId ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Selecciona una categoría
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Marca</label>
        <select
          name="brandId"
          required
          defaultValue={v?.brandId ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Selecciona una marca
          </option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Precio actual (Q)</label>
        <input
          name="price"
          type="number"
          min="1"
          step="1"
          required
          defaultValue={v?.price}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Precio de lista (Q)</label>
        <input
          name="oldPrice"
          type="number"
          min="1"
          step="1"
          required
          defaultValue={v?.oldPrice}
          className={inputClass}
        />
        <p className="mt-1 text-[11.5px] text-vt-muted-2">
          Igual al precio actual si no hay descuento.
        </p>
      </div>

      <div>
        <label className={labelClass}>Stock disponible</label>
        <input
          name="stock"
          type="number"
          min="0"
          step="1"
          required
          defaultValue={v?.stock}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Ícono de respaldo</label>
        <select
          name="icon"
          defaultValue={v?.icon ?? "package"}
          className={inputClass}
        >
          {PRODUCT_ICON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11.5px] text-vt-muted-2">
          Se muestra si el producto todavía no tiene foto.
        </p>
      </div>

      <div className="min-[880px]:col-span-2">
        <label className={labelClass}>Descripción</label>
        <textarea
          name="description"
          rows={4}
          required
          defaultValue={v?.description}
          className={inputClass}
        />
      </div>

      <div className="min-[880px]:col-span-2">
        <label className={labelClass}>Especificaciones técnicas</label>
        <textarea
          name="specs"
          rows={5}
          defaultValue={v?.specsText}
          placeholder={"Procesador: AMD Ryzen 5\nMemoria RAM: 16GB\nAlmacenamiento: 512GB SSD"}
          className={inputClass}
        />
        <p className="mt-1 text-[11.5px] text-vt-muted-2">
          Una especificación por línea, formato &quot;Nombre: Valor&quot;.
        </p>
      </div>

      <div className="min-[880px]:col-span-2">
        <label className={labelClass}>Foto de producto</label>
        {defaultValues?.existingImage && !removeImage && (
          <div className="mb-3 flex items-center gap-3">
            <div className="relative grid h-20 w-20 flex-none place-items-center overflow-hidden rounded-lg bg-white/[.05]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={defaultValues.existingImage}
                alt="Foto actual"
                className="absolute inset-0 h-full w-full object-contain p-1"
              />
            </div>
            <button
              type="button"
              onClick={() => setRemoveImage(true)}
              className="text-[12.5px] font-bold text-vt-error"
            >
              Quitar foto
            </button>
          </div>
        )}
        {removeImage && <input type="hidden" name="removeImage" value="true" />}
        <input
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className={inputClass}
        />
        <p className="mt-1 text-[11.5px] text-vt-muted-2">
          JPG, PNG, WEBP o GIF, máximo 5 MB. Solo funciona en el sitio desplegado (no en desarrollo local).
        </p>
      </div>

      {state.error && (
        <div className="min-[880px]:col-span-2 rounded-lg border border-vt-error/30 bg-vt-error/10 px-4 py-3 text-[13px] text-vt-error">
          {state.error}
        </div>
      )}

      <div className="min-[880px]:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="vt-btn vt-btn-accent rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-extrabold text-vt-accent-fg"
        >
          {isPending ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
