"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { uploadProductImage } from "@/lib/r2";
import { TAG_CATALOGO, TAG_PORTADA } from "@/lib/cache-tags";

export type ProductFormValues = {
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
};

// `values` devuelve lo que se escribió: React 19 reinicia los campos no
// controlados al terminar una acción de formulario, así que sin esto un error
// (por ejemplo un SKU repetido) borraba todo el producto ya tecleado.
export type ProductFormState = { error?: string; values?: ProductFormValues };

/**
 * Traduce el error a algo que Angel entienda. Prisma devuelve cosas como
 * "Unique constraint failed on the fields: (`sku`)", que no le dice nada a
 * quien está administrando la tienda.
 */
function describeProductError(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : "";
  if (/Unique constraint/i.test(raw) && /sku/i.test(raw)) {
    return "Ese SKU ya lo tiene otro producto. Usa un código distinto.";
  }
  if (/Foreign key constraint/i.test(raw)) {
    return "La categoría o la marca seleccionada ya no existe. Vuelve a elegirla.";
  }
  // Los errores que lanzamos nosotros en readProductFields ya están en español.
  return raw && !/prisma|constraint|invalid `/i.test(raw) ? raw : fallback;
}

/** Lee los campos tal cual, sin validar, para poder devolverlos ante un error. */
function readRawProductValues(formData: FormData): ProductFormValues {
  const s = (k: string) => String(formData.get(k) ?? "");
  const n = (k: string) => Number(formData.get(k) ?? 0);
  return {
    name: s("name").trim(),
    sku: s("sku").trim(),
    description: s("description").trim(),
    icon: s("icon") || "package",
    categoryId: s("categoryId"),
    brandId: s("brandId"),
    price: n("price"),
    oldPrice: n("oldPrice"),
    stock: n("stock"),
    specsText: s("specs"),
  };
}

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
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const url = await uploadProductImage(file);
    return [url];
  }
  return existing;
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

  // El formulario ya no pide calificación ni número de reseñas: eran datos de
  // ejemplo que un producto nuevo nunca tiene de verdad (rating fijo en 5,
  // 0 reseñas), y publicarlos como si fueran reales — sobre todo en los datos
  // estructurados que Google indexa — es justo el tipo de reseña falsa que
  // Google penaliza. La calificación real vive en el modelo `Review`
  // (src/lib/review-actions.ts), no en el producto.
  return { name, sku, description, icon, categoryId, brandId, price, oldPrice, stock, rating: 0, reviews: 0, specs };
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
    return {
      error: describeProductError(err, "No se pudo crear el producto."),
      values: readRawProductValues(formData),
    };
  }

  updateTag(TAG_CATALOGO);
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
    return {
      error: describeProductError(err, "No se pudo actualizar el producto."),
      values: readRawProductValues(formData),
    };
  }

  updateTag(TAG_CATALOGO);
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath(`/producto/${productId}`);
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();

  // Un pedido es historial de ventas: si se borrara el producto, ese pedido
  // pasaría a decir "producto desconocido" y se perdería qué se vendió.
  const enPedidos = await prisma.orderItem.count({ where: { productId } });
  if (enPedidos > 0) {
    redirect(
      "/admin/productos?error=" +
        encodeURIComponent(
          "No se puede eliminar: este producto ya aparece en pedidos y borrarlo dejaría ese historial incompleto. Usa el botón Ocultar para que deje de verse en la tienda."
        )
    );
  }

  try {
    // Un carrito NO es historial: es algo pasajero que alguien dejó a medias.
    // Se limpia solo para no bloquear el borrado por un carrito abandonado.
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId } }),
      prisma.review.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);
  } catch {
    redirect(
      "/admin/productos?error=" +
        encodeURIComponent(
          "No se pudo eliminar el producto. Usa el botón Ocultar para quitarlo de la tienda."
        )
    );
  }

  updateTag(TAG_CATALOGO);
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/productos");
}

/** Saca (o devuelve) el producto de la tienda sin tocar el historial de ventas. */
export async function toggleProductVisibility(productId: string, visible: boolean) {
  await requireAdmin();

  await prisma.product.update({ where: { id: productId }, data: { visible } });

  updateTag(TAG_CATALOGO);
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  revalidatePath(`/producto/${productId}`);
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

  updateTag(TAG_CATALOGO);
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

  updateTag(TAG_CATALOGO);
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

  updateTag(TAG_CATALOGO);
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

  updateTag(TAG_CATALOGO);
  revalidatePath("/admin/categorias");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/categorias");
}

export type SiteSettingsFormState = { error?: string };

// Topes pensados para que el hero no se descuadre: el título es el texto
// grande y basta con pasarse un poco para que rompa el diseño en móvil.
const HERO_LIMITS = { badge: 60, title: 70, titleAccent: 30, subtitle: 300 };

export type HeroContentFormState = { error?: string; ok?: boolean };

export async function updateHeroContent(
  _prevState: HeroContentFormState,
  formData: FormData
): Promise<HeroContentFormState> {
  await requireAdmin();

  const badge = String(formData.get("badge") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const titleAccent = String(formData.get("titleAccent") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();

  if (!title) {
    return { error: "El título no puede quedar vacío." };
  }
  for (const [campo, valor, tope] of [
    ["La insignia", badge, HERO_LIMITS.badge],
    ["El título", title, HERO_LIMITS.title],
    ["La palabra destacada", titleAccent, HERO_LIMITS.titleAccent],
    ["El párrafo", subtitle, HERO_LIMITS.subtitle],
  ] as const) {
    if (valor.length > tope) {
      return { error: `${campo} no puede pasar de ${tope} caracteres.` };
    }
  }

  const data = {
    heroBadge: badge,
    heroTitle: title,
    heroTitleAccent: titleAccent,
    heroSubtitle: subtitle,
  };

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: data,
    create: { id: "main", ...data },
  });

  updateTag(TAG_PORTADA);
  revalidatePath("/admin/portada");
  revalidatePath("/");
  return { ok: true };
}

// Devuelve los cuatro campos a null para que la home vuelva a mostrar los
// textos por defecto de HERO_DEFAULTS.
export async function resetHeroContent() {
  await requireAdmin();
  const data = {
    heroBadge: null,
    heroTitle: null,
    heroTitleAccent: null,
    heroSubtitle: null,
  };
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: data,
    create: { id: "main", ...data },
  });
  updateTag(TAG_PORTADA);
  revalidatePath("/admin/portada");
  revalidatePath("/");
}

async function revalidateReviewPaths(productId: string) {
  revalidatePath("/admin/resenas");
  revalidatePath(`/producto/${productId}`);
}

export async function approveReview(reviewId: string) {
  await requireAdmin();
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { status: "APPROVED" },
  });
  await revalidateReviewPaths(review.productId);
}

export async function rejectReview(reviewId: string) {
  await requireAdmin();
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { status: "REJECTED" },
  });
  await revalidateReviewPaths(review.productId);
}

export async function deleteReview(reviewId: string) {
  await requireAdmin();
  const review = await prisma.review.delete({ where: { id: reviewId } });
  await revalidateReviewPaths(review.productId);
}

export type CouponFormState = { error?: string };

export async function createCoupon(
  _prevState: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  await requireAdmin();

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "PERCENT");
  const value = Number(formData.get("value"));
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();
  const usageLimitRaw = String(formData.get("usageLimit") ?? "").trim();

  if (!code) return { error: "El código no puede estar vacío." };
  if (type !== "PERCENT" && type !== "FIXED") return { error: "Tipo de cupón inválido." };
  if (!Number.isFinite(value) || value <= 0) {
    return { error: "El valor debe ser un número mayor a 0." };
  }
  if (type === "PERCENT" && value > 100) {
    return { error: "Un cupón de porcentaje no puede ser mayor a 100." };
  }

  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    return { error: "Fecha de expiración inválida." };
  }

  let usageLimit: number | null = null;
  if (usageLimitRaw) {
    usageLimit = Number(usageLimitRaw);
    if (!Number.isInteger(usageLimit) || usageLimit <= 0) {
      return { error: "El límite de usos debe ser un número entero mayor a 0." };
    }
  }

  try {
    await prisma.coupon.create({
      data: { code, type, value: Math.round(value), expiresAt, usageLimit },
    });
  } catch {
    return { error: `Ya existe un cupón con el código "${code}".` };
  }

  revalidatePath("/admin/cupones");
  return {};
}

export async function toggleCoupon(couponId: string, active: boolean) {
  await requireAdmin();
  await prisma.coupon.update({ where: { id: couponId }, data: { active } });
  revalidatePath("/admin/cupones");
}
