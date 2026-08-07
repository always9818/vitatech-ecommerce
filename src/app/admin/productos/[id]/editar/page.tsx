import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategoryOptions, getBrands } from "@/lib/catalog";
import { updateProduct } from "@/lib/admin-actions";
import { ProductForm } from "@/components/admin/ProductForm";
import { resolveProductIcon } from "@/lib/product-icon";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { category: true } }),
    getCategoryOptions(),
    getBrands(),
  ]);

  if (!product) notFound();

  const specs = (product.specs as { k: string; v: string }[]) ?? [];
  const specsText = specs.map((s) => `${s.k}: ${s.v}`).join("\n");
  const boundUpdate = updateProduct.bind(null, product.id);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Editar producto</h1>
      <ProductForm
        action={boundUpdate}
        categories={categories}
        brands={brands}
        submitLabel="Guardar cambios"
        defaultValues={{
          name: product.name,
          sku: product.sku,
          description: product.description,
          icon: resolveProductIcon(product.icon, product.category.name),
          categoryId: product.categoryId,
          brandId: product.brandId,
          price: product.price,
          oldPrice: product.oldPrice,
          stock: product.stock,
          specsText,
          existingImages: product.images,
        }}
      />
    </div>
  );
}
