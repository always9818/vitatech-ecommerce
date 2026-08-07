import { getCategoryOptions, getBrands } from "@/lib/catalog";
import { createProduct } from "@/lib/admin-actions";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([getCategoryOptions(), getBrands()]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Nuevo producto</h1>
      <ProductForm
        action={createProduct}
        categories={categories}
        brands={brands}
        submitLabel="Crear producto"
      />
    </div>
  );
}
