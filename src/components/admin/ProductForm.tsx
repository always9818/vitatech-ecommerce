"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { ProductFormState } from "@/lib/admin-actions";
import { PRODUCT_ICON_OPTIONS } from "@/lib/product-icon";
import { Icon } from "@/components/Icon";

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
    existingImages?: string[];
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
  // Las fotos que ya tenía el producto y siguen ahí. Empieza con todas; quitar
  // una la saca de esta lista nada más — no se borra de R2 hasta guardar, y si
  // el admin cierra sin guardar, no pasó nada.
  const [fotosActuales, setFotosActuales] = useState(defaultValues?.existingImages ?? []);
  // Previsualización de las fotos nuevas elegidas en el input, para que el
  // admin vea de una vez qué va a agregar en vez de confiar en el nombre del
  // archivo. Se generan con `URL.createObjectURL`, así que hay que liberarlas
  // cuando cambian o el componente se desmonta.
  const [nuevasPreview, setNuevasPreview] = useState<{ file: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const v = defaultValues;

  // Este sí es controlado (a diferencia del resto de campos) porque los botones
  // de plantilla necesitan poder escribir en él.
  const [specsText, setSpecsText] = useState(v?.specsText ?? "");

  // Siempre apunta al `nuevasPreview` más reciente, para poder leerlo al
  // desmontar sin que el efecto de limpieza tenga que re-suscribirse cada vez
  // que cambia — si dependiera de `nuevasPreview` directamente, su limpieza
  // correría en CADA cambio (no solo al desmontar) y revocaría las URLs de
  // fotos que el admin recién había agregado, dejándolas rotas en la
  // previsualización. Se actualiza en un efecto (no durante el render, que
  // React prohíbe) — escribir en un ref es justo para eso.
  const nuevasPreviewRef = useRef(nuevasPreview);
  useEffect(() => {
    nuevasPreviewRef.current = nuevasPreview;
  }, [nuevasPreview]);

  // Libera las URLs de previsualización que queden sin usar cuando el
  // formulario se desmonta (ej. el admin navega a otra página sin guardar) —
  // quitar una foto individual ya libera la suya de una vez en `quitarNueva`.
  useEffect(() => {
    return () => {
      nuevasPreviewRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  // El input de archivos, al tener `multiple`, reemplaza TODA su selección
  // cada vez que el admin vuelve a abrir el explorador — así que para poder
  // "agregar más fotos después" en una segunda selección, hay que llevar la
  // cuenta nosotros mismos y reescribir `input.files` con la lista completa
  // via `DataTransfer` (es la única forma estándar de hacerlo; no se puede
  // asignar un array directo a `.files`).
  function sincronizarInput(archivos: File[]) {
    const dt = new DataTransfer();
    archivos.forEach((f) => dt.items.add(f));
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  }

  function agregarArchivos(lista: FileList | null) {
    if (!lista || lista.length === 0) return;
    const nuevos = Array.from(lista).map((file) => ({ file, url: URL.createObjectURL(file) }));
    setNuevasPreview((prev) => {
      const combinado = [...prev, ...nuevos];
      sincronizarInput(combinado.map((p) => p.file));
      return combinado;
    });
  }

  function quitarNueva(index: number) {
    setNuevasPreview((prev) => {
      const objetivo = prev[index];
      if (objetivo) URL.revokeObjectURL(objetivo.url);
      const resto = prev.filter((_, i) => i !== index);
      sincronizarInput(resto.map((p) => p.file));
      return resto;
    });
  }

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
        <label className={labelClass}>Fotos del producto</label>
        <p className="mb-3 text-[11.5px] text-vt-muted-2">
          Puedes subir varias — la primera es la que se ve en el catálogo y en las tarjetas; las demás
          aparecen como miniaturas debajo en la ficha, para que el cliente pueda verlas todas antes de
          comprar.
        </p>

        {(fotosActuales.length > 0 || nuevasPreview.length > 0) && (
          <div className="mb-3 grid grid-cols-4 gap-3 min-[520px]:grid-cols-6">
            {fotosActuales.map((url, i) => (
              <div key={url} className="relative">
                <div className="relative grid aspect-square place-items-center overflow-hidden rounded-lg bg-white/[.05]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="absolute inset-0 h-full w-full object-contain p-1" />
                </div>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9.5px] font-bold text-white">
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setFotosActuales((prev) => prev.filter((u) => u !== url))}
                  aria-label="Quitar esta foto"
                  className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-vt-error text-white"
                >
                  <Icon name="xCircle" className="h-4 w-4" />
                </button>
                {/* Una por cada foto que se conserva: así el servidor sabe
                    exactamente cuáles quedaron sin tener que volver a
                    consultar el producto en la base. */}
                <input type="hidden" name="keepImages" value={url} />
              </div>
            ))}
            {nuevasPreview.map(({ url }, i) => (
              <div key={url} className="relative">
                <div className="relative grid aspect-square place-items-center overflow-hidden rounded-lg border-2 border-vt-accent/40 bg-white/[.05]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="absolute inset-0 h-full w-full object-contain p-1" />
                </div>
                {fotosActuales.length === 0 && i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9.5px] font-bold text-white">
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => quitarNueva(i)}
                  aria-label="Quitar esta foto"
                  className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-vt-error text-white"
                >
                  <Icon name="xCircle" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          name="images"
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => agregarArchivos(e.target.files)}
          className={inputClass}
        />
        <p className="mt-1 text-[11.5px] text-vt-muted-2">
          JPG, PNG, WEBP o GIF, máximo 5 MB cada una. Solo funciona en el sitio desplegado (no en
          desarrollo local).
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
