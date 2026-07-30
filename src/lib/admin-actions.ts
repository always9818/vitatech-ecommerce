"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { uploadProductImage } from "@/lib/r2";

export type ProductFormState = { error?: string };

function parseSpecs(raw: string): { k: string; v: string }[] {
  const specs: { k: string; v: string }[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [k, ...rest] = trimmed.split(":");
    if (!k || rest.length === 0) continue;
    specs.push({ k: k.trim(), v: rest.join(":").trim() });
  }
  return specs;
}

async function resolveImageUrls(formData: FormData, existing: string[]): Promise<string[]> {
  const images = [...existing];
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const url = await uploadProductImage(file);
    images.push(url);
  }
  return images;
}

function readProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "package").trim() || "package";
  const categoryId = String(formData.get("categoryId") ?? "");
  const brandId = String(formData.get("brandId") ?? "");
  const price = Number(formData.get("price"));
  const oldPrice = Number(formData.get("oldPrice"));
  const stock = Number(formData.get("stock"));
  const rating = Number(formData.get("rating") ?? 5);
  const reviews = Number(formData.get("reviews") ?? 0);
  const specs = parseSpecs(String(formData.get("specs") ?? ""));

  if (!name || !sku || !categoryId || !brandId) {
    throw new Error("Nombre, SKU, categoría y marca son obligatorios.");
  }
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("El precio debe ser un número mayor a 0.");
  }
  if (!Number.isFinite(oldPrice) || oldPrice <= 0) {
    throw new Error("El precio de lista debe ser un número mayor a 0.");
  }
  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error("El stock debe ser un número mayor o igual a 0.");
  }

  return { name, sku, description, icon, categoryId, brandId, price, oldPrice, stock, rating, reviews, specs };
}

export async function createProduct(_prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  try {
    const fields = readProductFields(formData);
    const images = await resolveImageUrls(formData, []);

    await prisma.product.create({
      data: { ...fields, images },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo crear el producto." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  try {
    const existing = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    const fields = readProductFields(formData);
    const removeImage = formData.get("removeImage") === "true";
    const baseImages = removeImage ? [] : existing.images;
    const images = await resolveImageUrls(formData, baseImages);

    await prisma.product.update({
      where: { id: productId },
      data: { ...fields, images },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo actualizar el producto." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath(`/producto/${productId}`);
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();

  try {
    await prisma.product.delete({ where: { id: productId } });
  } catch {
    redirect(
      "/admin/productos?error=" +
        encodeURIComponent(
          "No se pudo eliminar: el producto ya tiene carritos u órdenes asociadas. Pon el stock en 0 para ocultarlo del catálogo en su lugar."
        )
    );
  }

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/productos");
}

export type TaxonomyFormState = { error?: string };

export async function createCategory(
  _prevState: TaxonomyFormState,
  formData: FormData
): Promise<TaxonomyFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre de la categoría no puede estar vacío." };

  try {
    await prisma.category.create({ data: { name } });
  } catch {
    return { error: `Ya existe una categoría llamada "${name}".` };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos/nuevo");
  revalidatePath("/catalogo");
  revalidatePath("/");
  return {};
}

export async function createBrand(
  _prevState: TaxonomyFormState,
  formData: FormData
): Promise<TaxonomyFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre de la marca no puede estar vacío." };

  try {
    await prisma.brand.create({ data: { name } });
  } catch {
    return { error: `Ya existe una marca llamada "${name}".` };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos/nuevo");
  revalidatePath("/catalogo");
  revalidatePath("/");
  return {};
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();

  try {
    await prisma.category.delete({ where: { id: categoryId } });
  } catch {
    redirect(
      "/admin/categorias?error=" +
        encodeURIComponent("No se pudo eliminar: hay productos usando esa categoría.")
    );
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/categorias");
}

export async function deleteBrand(brandId: string) {
  await requireAdmin();

  try {
    await prisma.brand.delete({ where: { id: brandId } });
  } catch {
    redirect(
      "/admin/categorias?error=" +
        encodeURIComponent("No se pudo eliminar: hay productos usando esa marca.")
    );
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/categorias");
}
