import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = ["Laptops", "Celulares", "Monitores", "Audio", "Accesorios", "Impresoras"];
const BRANDS = ["HP", "Lenovo", "Asus", "Samsung", "Xiaomi", "Epson"];

function specsFor(cat: string, brand: string) {
  if (cat === "Laptops")
    return [
      { k: "Procesador", v: brand === "Asus" ? "Intel Core i7 · 8 núcleos" : "AMD Ryzen 5 · 6 núcleos" },
      { k: "Memoria RAM", v: "16GB DDR4" },
      { k: "Almacenamiento", v: "SSD NVMe 512GB" },
      { k: "Pantalla", v: "15.6\" FHD IPS" },
      { k: "Garantía", v: "12 meses" },
    ];
  if (cat === "Celulares")
    return [
      { k: "Pantalla", v: "6.7\" AMOLED 120Hz" },
      { k: "Almacenamiento", v: "256GB" },
      { k: "Cámara", v: "108MP + ultra gran angular" },
      { k: "Batería", v: "5000 mAh" },
      { k: "Garantía", v: "12 meses" },
    ];
  return [
    { k: "Marca", v: brand },
    { k: "Categoría", v: cat },
    { k: "Conectividad", v: "USB / inalámbrico" },
    { k: "Garantía", v: "12 meses" },
  ];
}

const CATALOG = [
  { sku: "VT-LAP-0001", name: "Laptop 15.6\" Ryzen 5 · 16GB RAM · 512GB SSD", cat: "Laptops", brand: "Lenovo", price: 4999, old: 6299, stock: 14, rating: 4.8, reviews: 126, icon: "💻", images: [], description: "Rendimiento fluido para trabajo y estudio, con pantalla FHD antirreflejo y SSD ultrarrápido. Ideal para multitarea diaria y batería de larga duración." },
  { sku: "VT-LAP-0002", name: "Laptop gamer 16\" Core i7 · RTX 4060 · 1TB", cat: "Laptops", brand: "Asus", price: 9899, old: 11499, stock: 5, rating: 4.9, reviews: 84, icon: "💻", images: [], description: "Gráficos RTX y pantalla 165Hz para gaming exigente y creación de contenido. Sistema de enfriamiento reforzado para sesiones largas." },
  { sku: "VT-CEL-0001", name: "Smartphone 6.7\" 5G · 256GB · Cámara 108MP", cat: "Celulares", brand: "Samsung", price: 3499, old: 4199, stock: 22, rating: 4.7, reviews: 210, icon: "📱", images: [], description: "Cámara de alta resolución, batería de larga duración y conectividad 5G. Pantalla AMOLED de 120Hz para una experiencia visual fluida." },
  { sku: "VT-CEL-0002", name: "Smartphone 6.1\" 128GB · doble cámara", cat: "Celulares", brand: "Xiaomi", price: 1799, old: 2199, stock: 31, rating: 4.6, reviews: 158, icon: "📱", images: [], description: "El equilibrio perfecto entre precio y rendimiento para el día a día, con doble cámara y carga rápida." },
  { sku: "VT-MON-0001", name: "Monitor gamer 27\" 165Hz QHD IPS", cat: "Monitores", brand: "Asus", price: 1899, old: 2499, stock: 9, rating: 4.8, reviews: 73, icon: "🖥️", images: [], description: "Colores precisos y respuesta ultrarrápida para gaming y diseño. Panel IPS con ángulos de visión amplios." },
  { sku: "VT-MON-0002", name: "Monitor 24\" FHD IPS bordes delgados", cat: "Monitores", brand: "HP", price: 999, old: 1299, stock: 0, rating: 4.5, reviews: 61, icon: "🖥️", images: [], description: "Diseño elegante y panel IPS para uso profesional cómodo, con bordes delgados ideales para setups múltiples." },
  { sku: "VT-AUD-0001", name: "Audífonos inalámbricos cancelación de ruido", cat: "Audio", brand: "Samsung", price: 749, old: 999, stock: 40, rating: 4.7, reviews: 189, icon: "🎧", images: [], description: "Cancelación activa de ruido y hasta 30h de batería. Conexión estable multipunto con dos dispositivos a la vez." },
  { sku: "VT-AUD-0002", name: "Barra de sonido 2.1 con subwoofer", cat: "Audio", brand: "HP", price: 1099, old: 1399, stock: 6, rating: 4.4, reviews: 42, icon: "🔊", images: [], description: "Sonido envolvente potente para tu sala o setup, con subwoofer independiente y conexión Bluetooth." },
  { sku: "VT-ACC-0001", name: "Teclado mecánico RGB switch red", cat: "Accesorios", brand: "Xiaomi", price: 449, old: 599, stock: 18, rating: 4.6, reviews: 97, icon: "⌨️", images: [], description: "Switches mecánicos precisos e iluminación RGB personalizable, estructura resistente para uso intensivo." },
  { sku: "VT-ACC-0002", name: "Mouse inalámbrico ergonómico 6 botones", cat: "Accesorios", brand: "Lenovo", price: 199, old: 299, stock: 27, rating: 4.5, reviews: 133, icon: "🖱️", images: [], description: "Comodidad todo el día con sensor de alta precisión y batería recargable de larga duración." },
  { sku: "VT-IMP-0001", name: "Impresora multifuncional WiFi tinta continua", cat: "Impresoras", brand: "Epson", price: 1299, old: 1599, stock: 11, rating: 4.6, reviews: 88, icon: "🖨️", images: [], description: "Bajo costo por página con sistema de tinta continua y WiFi integrado para imprimir desde cualquier dispositivo." },
  { sku: "VT-IMP-0002", name: "Impresora láser monocromática", cat: "Impresoras", brand: "HP", price: 899, old: 1099, stock: 3, rating: 4.4, reviews: 54, icon: "🖨️", images: [], description: "Impresión rápida y nítida para oficina y hogar, con bajo consumo y mantenimiento mínimo." },
];

async function main() {
  const categoryByName = new Map<string, string>();
  for (const name of CATEGORIES) {
    const c = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    categoryByName.set(name, c.id);
  }

  const brandByName = new Map<string, string>();
  for (const name of BRANDS) {
    const b = await prisma.brand.upsert({ where: { name }, update: {}, create: { name } });
    brandByName.set(name, b.id);
  }

  for (const p of CATALOG) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        price: p.price,
        oldPrice: p.old,
        stock: p.stock,
        rating: p.rating,
        reviews: p.reviews,
        icon: p.icon,
        images: p.images,
        description: p.description,
        specs: specsFor(p.cat, p.brand),
        categoryId: categoryByName.get(p.cat)!,
        brandId: brandByName.get(p.brand)!,
      },
    });
  }

  console.log(`Seed listo: ${CATEGORIES.length} categorías, ${BRANDS.length} marcas, ${CATALOG.length} productos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
