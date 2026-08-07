import type { IconName } from "@/components/Icon";
import { Department } from "@/generated/prisma/enums";

/**
 * Los dos mundos de la tienda.
 *
 * El nombre VITATECH siempre fue literal — "VITA" por vitaminas y suplementos,
 * "TECH" por tecnología — pero hasta el 2026-08-07 el sitio solo vendía lo
 * segundo. Este archivo es la única fuente de cómo se llama y se ve cada
 * departamento de cara al cliente: si algún día cambia el nombre público de
 * "Salud y Bienestar", se cambia aquí y se actualiza en menú, portada,
 * catálogo, panel y migas de pan a la vez.
 */
export type DepartmentInfo = {
  slug: string;
  /** Como se lee en el menú y las migas de pan. */
  label: string;
  /** Frase corta para la portada y las descripciones de página. */
  tagline: string;
  icon: IconName;
};

export const DEPARTMENTS: Record<Department, DepartmentInfo> = {
  TECNOLOGIA: {
    slug: "tecnologia",
    label: "Tecnología",
    tagline: "Equipo original con garantía real",
    icon: "laptop",
  },
  SALUD: {
    slug: "salud",
    label: "Salud y Bienestar",
    tagline: "Suplementos y vitaminas de marcas confiables",
    icon: "supplement",
  },
};

/** En el orden en que se muestran en el menú y la portada. */
export const DEPARTMENT_ORDER: Department[] = [Department.TECNOLOGIA, Department.SALUD];

/** Traduce el `?dept=` de la URL al valor del enum. Devuelve null si no calza. */
export function departmentFromSlug(slug: string | undefined): Department | null {
  if (!slug) return null;
  const match = DEPARTMENT_ORDER.find((d) => DEPARTMENTS[d].slug === slug);
  return match ?? null;
}

export { Department };
