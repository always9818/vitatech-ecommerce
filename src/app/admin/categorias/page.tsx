import { prisma } from "@/lib/prisma";
import { createCategory, createBrand, deleteCategory, deleteBrand } from "@/lib/admin-actions";
import { TaxonomySection } from "@/components/admin/TaxonomySection";
import { DEPARTMENTS, DEPARTMENT_ORDER } from "@/lib/departments";

export default async function AdminTaxonomyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Categorías y marcas</h1>
      <p className="mt-2 text-[13.5px] text-vt-muted-1">
        Las que crees aquí aparecen de inmediato en el formulario de productos y en los filtros del
        catálogo.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-vt-error/30 bg-vt-error/10 px-4 py-3 text-[13px] text-vt-error">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 min-[880px]:grid-cols-2">
        <TaxonomySection
          title="Categorías"
          items={categories.map((c) => ({
            id: c.id,
            name: c.name,
            productCount: c._count.products,
            groupLabel: DEPARTMENTS[c.department].label,
          }))}
          createAction={createCategory}
          deleteAction={deleteCategory}
          placeholder="Ej. Vitaminas"
          groupOptions={DEPARTMENT_ORDER.map((d) => ({ value: d, label: DEPARTMENTS[d].label }))}
          groupLabel="¿A qué departamento pertenece?"
          groupHelp="Define en qué parte de la tienda aparece: junto a la tecnología o junto a los suplementos."
        />
        <TaxonomySection
          title="Marcas"
          items={brands.map((b) => ({ id: b.id, name: b.name, productCount: b._count.products }))}
          createAction={createBrand}
          deleteAction={deleteBrand}
          placeholder="Ej. Acer"
        />
      </div>
    </div>
  );
}
