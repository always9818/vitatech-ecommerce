import { getCloudflareContext } from "@opennextjs/cloudflare";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("La imagen no puede pesar más de 5 MB.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const bucket = env.PRODUCT_IMAGES;
  if (!bucket) {
    throw new Error(
      "El almacenamiento de imágenes (R2) no está disponible en este entorno. La subida de fotos solo funciona en el sitio desplegado en Cloudflare."
    );
  }

  const extension = file.type.split("/")[1] ?? "jpg";
  const key = `productos/${crypto.randomUUID()}.${extension}`;

  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) {
    throw new Error("Falta la variable de entorno R2_PUBLIC_URL.");
  }

  return `${publicUrl}/${key}`;
}
