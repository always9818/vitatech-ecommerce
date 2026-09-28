import { money, discountPct } from "@/lib/money";

/**
 * Meta description de la ficha de producto: el texto que Google muestra bajo
 * el título y el que aparece al compartir el enlace por WhatsApp o Facebook.
 *
 * Antes era `description.slice(0, 155)`: salían saltos de línea en medio,
 * frases cortadas a la mitad, líneas como "Vence: 7/2027" o el nombre repetido,
 * y nunca el precio. Ahora se arma así, en ~155 caracteres (lo que Google
 * muestra antes de cortar con "…"):
 *
 *   {nombre} a {precio}[, antes {precio anterior}]. {lo mejor de la descripción} {cierre}
 *
 * El cierre dice "Envío a todo Guatemala" si hay stock; si no, invita a
 * preguntar — prometer envío de algo agotado es invitar a un reclamo.
 */
const LARGO_MAXIMO = 155;
const LARGO_MINIMO_CUERPO = 25;

// Líneas que no dicen nada útil en un resultado de búsqueda.
const LINEA_DESCARTABLE =
  /^(vence|vencimiento|fecha de vencimiento|lote|sku|c[oó]digo|modelo|ref(erencia)?|caracter[ií]sticas( del producto)?|especificaciones|descripci[oó]n)\b[^a-z0-9]*\S{0,20}$/i;

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Deja la descripción en frases limpias, sin viñetas ni saltos de línea. */
export function limpiarDescripcion(descripcion: string, nombre: string): string {
  const nombreNorm = normalizar(nombre);
  const frases = descripcion
    .split(/\r?\n+/)
    .map((l) => l.replace(/^\s*[-*•·>]+\s*/, "").replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 0)
    .filter((l) => !LINEA_DESCARTABLE.test(l))
    // El nombre ya va al principio: una línea que solo lo repite (o repite
    // parte de él, como "Aspiradora multifunciones" en "Aspiradora
    // recargable multifunciones") sobra.
    .filter((l) => {
      const palabras = normalizar(l).split(" ").filter(Boolean);
      const delNombre = new Set(nombreNorm.split(" "));
      return palabras.length > 0 && !palabras.every((w) => delNombre.has(w));
    })
    // Cada línea suelta se vuelve una frase: si no termina en puntuación, se
    // le pone punto para que no quede "Sabor a Limón Apoyo en estados de...".
    .map((l) => (/[.!?:;…]$/.test(l) ? l : `${l}.`));
  return frases.join(" ").replace(/\s+([.,;:])/g, "$1");
}

// Palabras con las que una frase no puede terminar: "para trabajo y…" se lee
// cortado; "para trabajo…" no tanto.
const CONECTORES = new Set(
  "y e o u de del al a en con por para que el la los las un una unos unas su sus lo como sin tu".split(" "),
);

/**
 * Recorta sin partir palabras. Si dentro del límite termina una frase
 * completa y ocupa al menos la mitad del espacio, se corta ahí (sin "…");
 * si no, en la última palabra con sentido y con "…".
 */
function recortar(texto: string, max: number) {
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max);
  const finDeFrase = Math.max(corte.lastIndexOf(". "), corte.lastIndexOf("! "), corte.lastIndexOf("? "));
  if (finDeFrase >= max * 0.5) return corte.slice(0, finDeFrase + 1);

  const palabras = texto.slice(0, max - 1).split(" ");
  palabras.pop(); // la última puede estar partida
  while (palabras.length > 1 && CONECTORES.has(normalizar(palabras[palabras.length - 1]))) palabras.pop();
  return `${palabras.join(" ").replace(/[\s,;:.–—-]+$/, "")}…`;
}

export function productMetaDescription(p: {
  name: string;
  price: number;
  oldPrice: number;
  stock: number;
  description: string;
}): string {
  const descuento = discountPct(p.price, p.oldPrice);
  const inicio = `${p.name} a ${money(p.price)}${descuento > 0 ? `, antes ${money(p.oldPrice)}` : ""}.`;
  const cierre = p.stock > 0 ? "Envío a todo Guatemala." : "Agotado: pregúntanos por WhatsApp.";

  const cuerpo = limpiarDescripcion(p.description, p.name);
  const espacio = LARGO_MAXIMO - inicio.length - cierre.length - 2;

  // Si el nombre es tan largo que no cabe un cuerpo con sentido, mejor sin él
  // que con tres palabras sueltas y "…".
  if (!cuerpo || espacio < LARGO_MINIMO_CUERPO) {
    return recortar(`${inicio} ${cierre}`, LARGO_MAXIMO);
  }
  return `${inicio} ${recortar(cuerpo, espacio)} ${cierre}`;
}
