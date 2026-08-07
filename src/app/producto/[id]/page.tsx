import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, getRelatedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { money, discountPct } from "@/lib/money";
import { ProductDetailActions } from "@/components/ProductDetailActions";
import { Icon, type IconName } from "@/components/Icon";
import { resolveProductIcon } from "@/lib/product-icon";
import { getProductRatingStats } from "@/lib/reviews";
import { ReviewsSection } from "@/components/ReviewsSection";
import { pageMetadata, SITE_URL } from "@/lib/site";
import { WhatsAppProducto } from "@/components/WhatsAppButton";
import { mensajeProducto, whatsappUrl } from "@/lib/whatsapp";
import { DEPARTMENTS, type Department } from "@/lib/departments";
import { AVAILABLE_INSTALLMENTS } from "@/lib/recurrente";
import { ViewContentTracker } from "@/components/tracking/ViewContentTracker";

const MAX_INSTALLMENTS = Math.max(...AVAILABLE_INSTALLMENTS);

/**
 * Los beneficios cambian según el departamento: "servicio técnico" no aplica a
 * un bote de proteína, y "producto sellado" no aplica a una laptop.
 */
const BENEFITS: Record<Department, { icon: IconName; label: string }[]> = {
  TECNOLOGIA: [
    { icon: "truck", label: "Envío gratis desde Q 299" },
    { icon: "chat", label: "Soporte por WhatsApp" },
    { icon: "shield", label: "Garantía real" },
    { icon: "returns", label: "Cambios por desperfecto de fábrica" },
  ],
  SALUD: [
    { icon: "truck", label: "Envío gratis desde Q 299" },
    { icon: "chat", label: "Soporte por WhatsApp" },
    { icon: "shield", label: "Producto original y sellado" },
    { icon: "leaf", label: "Marcas confiables" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return {};

  return pageMetadata({
    title: product.name,
    description: product.description.slice(0, 155),
    path: `/producto/${id}`,
    image: product.images[0],
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // En paralelo: antes se esperaba el producto y solo después las estrellas,
  // pagando dos viajes seguidos. Pedir las estadísticas de un producto que no
  // existe es inofensivo — devuelve 0 reseñas.
  const [product, ratingStats] = await Promise.all([
    getProductById(id),
    getProductRatingStats(id),
  ]);
  if (!product) notFound();

  // Depende del `categoryId` del producto, así que no puede ir en el mismo
  // Promise.all de arriba: ese todavía no sabe qué producto es. En la
  // práctica es barato — se resuelve sobre la misma lista completa que ya
  // cachea `leerCatalogoVisible`, no dispara una consulta nueva a la base.
  const relacionados = await getRelatedProducts({
    productId: product.id,
    categoryId: product.category.id,
  });

  const departamento = product.category.department;
  const off = discountPct(product.price, product.oldPrice);
  const stockLabel =
    product.stock === 0 ? "Agotado" : product.stock <= 5 ? `Últimas ${product.stock} unidades` : "En stock";
  const specs = (product.specs as { k: string; v: string }[]) ?? [];
  // El monto es el de la cuota más baja (a MAX_INSTALLMENTS meses, el plazo
  // más largo); el checkout de Recurrente ofrece los demás plazos disponibles.
  const cuota =
    "Desde " + money(Math.round(product.price / MAX_INSTALLMENTS)) + `/mes en hasta ${MAX_INSTALLMENTS} cuotas sin intereses`;
  const fallbackIcon = resolveProductIcon(product.icon, product.category.name);
  const photos = product.images;
  const rating = Math.round(ratingStats.rating);
  const hasReviews = ratingStats.reviews > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: photos,
    brand: { "@type": "Brand", name: product.brand.name },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/producto/${product.id}`,
      priceCurrency: "GTQ",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(ratingStats.reviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: ratingStats.rating,
            reviewCount: ratingStats.reviews,
          },
        }
      : {}),
  };

  return (
    <div className="animate-vt-slide mx-auto max-w-[1180px] px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ViewContentTracker
        item={{ id: product.id, name: product.name, price: product.price, category: product.category.name }}
      />
      <div className="grid grid-cols-1 gap-10 min-[880px]:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="relative grid h-[400px] place-items-center overflow-hidden rounded-2xl bg-white/[.05] text-vt-muted-3">
            {photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photos[0]}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-contain p-6"
                // Es la foto principal de la página: se carga de inmediato, no
                // en diferido, porque casi siempre es lo primero que el
                // visitante ve al entrar.
                loading="eager"
              />
            ) : (
              <Icon name={fallbackIcon} className="h-28 w-28" />
            )}
          </div>
          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {photos.slice(0, 4).map((src) => (
                <div className="relative grid h-20 place-items-center overflow-hidden rounded-xl bg-white/[.05]" key={src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={product.name}
                    className="absolute inset-0 h-full w-full object-contain p-1.5"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {/* La categoría lleva al catálogo de su departamento, para que el
              cliente pueda seguir viendo cosas del mismo mundo. */}
          <div className="text-[12px] font-bold tracking-[.06em] text-vt-accent uppercase">
            <Link
              href={`/catalogo?dept=${DEPARTMENTS[departamento].slug}&cat=${encodeURIComponent(product.category.name)}`}
              className="hover:underline"
            >
              {product.category.name}
            </Link>{" "}
            · {product.brand.name} · SKU {product.sku}
          </div>
          <h1 className="font-heading mt-2 mb-3 text-[30px] leading-[1.15] font-bold text-white">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 text-[13px] text-vt-muted-1">
            {hasReviews && (
              <>
                <span className="flex items-center gap-0.5 text-vt-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon
                      key={i}
                      name="star"
                      filled={i < rating}
                      className={i < rating ? "h-3.5 w-3.5" : "h-3.5 w-3.5 text-vt-muted-3"}
                    />
                  ))}
                </span>
                <span>{ratingStats.rating.toFixed(1)}</span>
                <span>· {ratingStats.reviews} reseñas</span>
              </>
            )}
            <span className="font-bold text-vt-accent">
              {hasReviews ? "· " : ""}
              {stockLabel}
            </span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <div className="font-heading text-[34px] font-bold text-white">{money(product.price)}</div>
            {off > 0 && (
              <>
                <div className="pb-1.5 text-[15px] text-vt-muted-2 line-through">
                  {money(product.oldPrice)}
                </div>
                <span className="mb-1 rounded-full bg-vt-accent px-2.5 py-1 text-[11px] font-bold text-vt-accent-fg">
                  -{off}%
                </span>
              </>
            )}
          </div>
          <div className="mt-1.5 text-[12.5px] text-vt-muted-2">{cuota}</div>

          <p className="mt-6 text-[14px] leading-relaxed text-vt-muted-1">{product.description}</p>

          <div className="mt-6">
            <ProductDetailActions
              productId={product.id}
              stock={product.stock}
              trackingItem={{ id: product.id, name: product.name, price: product.price, category: product.category.name }}
            />
          </div>

          {/* Salida para quien no quiere comprar por el carrito: en Guatemala
              muchas ventas se cierran por chat. El mensaje ya lleva producto,
              precio y enlace, así que del lado de Angel no hay que adivinar
              de qué está hablando el cliente. */}
          <div className="mt-3">
            <WhatsAppProducto
              href={whatsappUrl(
                mensajeProducto({
                  nombre: product.name,
                  precio: money(product.price),
                  url: `${SITE_URL}/producto/${product.id}`,
                })
              )}
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {BENEFITS[departamento].map((b) => (
              <div key={b.label} className="flex items-center gap-2.5 text-[12.5px] text-vt-muted-1">
                <span className="flex-none text-vt-accent">
                  <Icon name={b.icon} className="h-[18px] w-[18px]" />
                </span>
                {b.label}
              </div>
            ))}
          </div>

          {/* Aviso obligado en cualquier tienda que venda suplementos: no son
              medicamentos y la tienda no debe insinuar que curan nada. Va
              automático en todo el departamento de Salud para que no dependa
              de que alguien se acuerde de escribirlo producto por producto. */}
          {departamento === "SALUD" && (
            <p className="mt-6 rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-[11.5px] leading-relaxed text-vt-muted-2">
              Este producto es un suplemento alimenticio: no es un medicamento y no está destinado a
              diagnosticar, tratar ni curar ninguna enfermedad. Consulta a tu médico antes de
              tomarlo, sobre todo si estás embarazada, lactando, tomas medicamento o tienes alguna
              condición de salud. Mantener fuera del alcance de los niños.
            </p>
          )}

          <div className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10">
            {specs.map((s) => (
              <div key={s.k} className="flex justify-between px-4 py-3 text-[13px]">
                <span className="text-vt-muted-2">{s.k}</span>
                <span className="font-semibold text-vt-fg">{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ReviewsSection productId={product.id} />

      {relacionados.length > 0 && (
        <section className="mt-14">
          <div className="font-heading text-[22px] font-bold text-white">
            También te puede interesar<span className="text-vt-accent">.</span>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 min-[880px]:grid-cols-4">
            {relacionados.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
