"use client";

import { useState, useTransition } from "react";
import type { ProductFormState } from "@/lib/admin-actions";
import { PRODUCT_ICON_OPTIONS } from "@/lib/product-icon";

type Option = { id: string; name: string };
/** Las categorías vienen agrupadas por departamento para el <optgroup>. */
type CategoryOption = Option & { departmentLabel: string };

type ProductFormProps = {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: CategoryOption[];
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

/**
 * Plantillas de especificaciones, una por tipo de producto.
 *
 * Un suplemento no se describe con procesador y memoria RAM: lo que el cliente
 * necesita saber es la presentación, cuánto trae y cuánto dura. Esto solo
 * rellena el cuadro de texto — Angel puede cambiar lo que quiera después.
 *
 * Ojo: NO se incluye ningún campo de "beneficios" ni "para qué sirve". Un
 * suplemento no es un medicamento y atribuirle propiedades curativas es
 * justamente lo que mete en problemas a una tienda; la descripción libre
 * queda para lo que diga la etiqueta del fabricante.
 */
const PLANTILLAS_SPECS = [
  {
    label: "Tecnología",
    texto: "Procesador: \nMemoria RAM: \nAlmacenamiento: \nPantalla: \nGarantía: ",
  },
  {
    label: "Suplemento",
    texto:
      "Presentación: 60 cápsulas\nContenido neto: \nPorción: 1 cápsula\nPorciones por envase: 60\nSabor: \nRegistro sanitario: ",
  },
  {
    label: "Proteína en polvo",
    texto:
      "Presentación: Bote de 2 lb\nContenido neto: 907 g\nPorción: 1 scoop (30 g)\nPorciones por envase: 30\nProteína por porción: 24 g\nSabor: \nRegistro sanitario: ",
  },
];

export function ProductForm({ action, categories, brands, submitLabel, defaultValues }: ProductFormProps) {
  const [state, setState] = useState<ProductFormState>({});
  const [isPending, startTransition] = useTransition();
  const [removeImage, setRemoveImage] = useState(false);

  const v = defaultValues;

  // Este sí es controlado (a diferencia del resto de campos) porque los botones
  // de plantilla necesitan poder escribir en él.
  const [specsText, setSpecsText] = useState(v?.specsText ?? "");

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
          {/* Agrupadas por departamento: la categoría es lo que decide si el
              producto sale entre la tecnología o entre los suplementos, así que
              conviene verlo al elegirla y no descubrirlo después en la tienda. */}
          {Object.entries(
            categories.reduce<Record<string, CategoryOption[]>>((grupos, c) => {
              (grupos[c.departmentLabel] ??= []).push(c);
              return grupos;
            }, {})
          ).map(([departamento, opciones]) => (
            <optgroup key={departamento} label={departamento}>
              {opciones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
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
        <label className={labelClass}>Especificaciones</label>
        <textarea
          name="specs"
          rows={5}
          value={specsText}
          onChange={(e) => setSpecsText(e.target.value)}
          placeholder={"Procesador: AMD Ryzen 5\nMemoria RAM: 16GB\nAlmacenamiento: 512GB SSD"}
          className={inputClass}
        />
        <p className="mt-1 text-[11.5px] text-vt-muted-2">
          Una especificación por línea, formato &quot;Nombre: Valor&quot;.
        </p>

        {/* Los suplementos se describen con datos distintos a los de una
            laptop. Estos botones solo rellenan el cuadro de arriba con la
            plantilla correspondiente para que Angel no tenga que acordarse de
            qué poner; puede borrar o cambiar lo que quiera después. */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="text-[11.5px] text-vt-muted-2">Plantillas:</span>
          {PLANTILLAS_SPECS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setSpecsText(p.texto)}
              className="rounded-lg border border-white/15 px-2.5 py-1 text-[11.5px] font-semibold text-vt-fg hover:border-vt-accent/50 hover:text-vt-accent"
            >
              {p.label}
            </button>
          ))}
        </div>
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
