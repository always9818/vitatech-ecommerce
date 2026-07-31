/**
 * Símbolo de la marca: la "V" de Vitatech formada por un trazo y una hoja.
 * Es el vector original de la propuesta de marca, no un PNG recortado, así que
 * se ve nítido en cualquier tamaño (favicon de 16px o cabecera).
 *
 * Los colores son fijos a propósito (no `currentColor`): son la marca, y por eso
 * es la excepción a la regla de iconos de línea del resto del sitio.
 */
const LIMA = "#A5D71E";
const TURQUESA = "#16B5A0";

export function VitatechMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Vitatech">
      <path d="M52 38 L100 162" stroke={LIMA} strokeWidth={22} strokeLinecap="round" fill="none" />
      <circle cx="52" cy="38" r="14" fill={TURQUESA} />
      <path d="M150 36 C170 92 146 144 100 164 C96 114 112 66 150 36 Z" fill={LIMA} />
    </svg>
  );
}

/** Marca + nombre, como se usa en la cabecera y el pie. */
export function VitatechLogo({
  className = "",
  markClassName = "h-7 w-7",
  textClassName = "text-xl",
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <VitatechMark className={markClassName} />
      <span className={`font-heading font-bold text-white ${textClassName}`}>
        VITA<span className="text-vt-accent">TECH_</span>
      </span>
    </span>
  );
}
