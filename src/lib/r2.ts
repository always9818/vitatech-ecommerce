import { getCloudflareContext } from "@opennextjs/cloudflare";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Tipo mínimo del bucket que necesitamos. Se declara aquí a propósito en vez de
// depender de `cloudflare-env.d.ts` (generado por `wrangler types`), porque ese
// archivo está en .gitignore y no existe durante el build de CI.
type ProductImagesBucket = {
  put: (
    key: string,
    value: ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } }
  ) => Promise<unknown>;
};

async function uploadImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("La imagen no puede pesar más de 5 MB.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const bucket = (env as unknown as { PRODUCT_IMAGES?: ProductImagesBucket }).PRODUCT_IMAGES;
  if (!bucket) {
    throw new Error(
      "El almacenamiento de imágenes (R2) no está disponible en este entorno. La subida de fotos solo funciona en el sitio desplegado en Cloudflare."
    );
  }

  // El nombre lleva un UUID nuevo en cada subida, así que dos imágenes nunca
  // comparten key: reemplazar la foto de un producto sube un archivo distinto,
  // nunca pisa el anterior. Por eso es seguro cachearla "para siempre" — el
  // navegador nunca tiene que volver a pedirla, ni siquiera si el producto se
  // edita después. Antes no se mandaba ningún `Cache-Control`, así que el
  // navegador repetía la descarga en cada visita a una página con esa foto.
  const extension = file.type.split("/")[1] ?? "jpg";
  const key = `${folder}/${crypto.randomUUID()}.${extension}`;

  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
  });

  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) {
    throw new Error("Falta la variable de entorno R2_PUBLIC_URL.");
  }

  return `${publicUrl}/${key}`;
}

export function uploadProductImage(file: File) {
  return uploadImage(file, "productos");
}

export function uploadSiteImage(file: File) {
  return uploadImage(file, "sitio");
}
