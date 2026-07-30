import type { IconName } from "@/components/Icon";

// Iconos que el administrador puede elegir para un producto.
export const PRODUCT_ICON_OPTIONS: { value: IconName; label: string }[] = [
  { value: "laptop", label: "Laptop" },
  { value: "smartphone", label: "Celular" },
  { value: "tablet", label: "Tablet" },
  { value: "monitor", label: "Monitor" },
  { value: "headphones", label: "Audífonos" },
  { value: "speaker", label: "Bocina" },
  { value: "keyboard", label: "Teclado" },
  { value: "mouse", label: "Mouse" },
  { value: "printer", label: "Impresora" },
  { value: "package", label: "Genérico" },
];

const VALID_ICONS = new Set<string>(PRODUCT_ICON_OPTIONS.map((o) => o.value));

const BY_CATEGORY: Record<string, IconName> = {
  Laptops: "laptop",
  Celulares: "smartphone",
  Tablets: "tablet",
  Monitores: "monitor",
  Audio: "headphones",
  Accesorios: "keyboard",
  Impresoras: "printer",
};

/**
 * Devuelve el icono a mostrar para un producto.
 *
 * El campo `icon` guardaba emojis en la versión original del catálogo; si el
 * valor almacenado no es un nombre de icono válido (p. ej. sigue siendo "💻"),
 * se deduce a partir de la categoría, y si tampoco coincide se usa el genérico.
 * Así no hace falta migrar la base de datos: al editar el producto se guarda
 * el nombre correcto.
 */
export function resolveProductIcon(icon: string, categoryName?: string): IconName {
  if (VALID_ICONS.has(icon)) return icon as IconName;
  if (categoryName && BY_CATEGORY[categoryName]) return BY_CATEGORY[categoryName];
  return "package";
}

/** Icono de la categoría (para los chips de la home y filtros). */
export function resolveCategoryIcon(categoryName: string): IconName {
  return BY_CATEGORY[categoryName] ?? "package";
}
