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

/**
 * El símbolo usado COMO la letra "V" de VITATECH, para no repetir la V dos
 * veces seguidas en el logotipo.
 *
 * Lleva un viewBox recortado a la forma real (el original tiene aire alrededor,
 * que como letra dejaría un hueco). El alto va en `em` para que crezca junto al
 * texto, y `-mr-[.06em]` compensa el espacio óptico del trazo diagonal.
 */
export function VitatechLetterV({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="34 20 142 158"
      className={`inline-block h-[0.92em] w-auto -mr-[.06em] align-[-.06em] ${className}`}
      role="img"
      aria-label="V"
    >
      <path d="M52 38 L100 162" stroke={LIMA} strokeWidth={22} strokeLinecap="round" fill="none" />
      <circle cx="52" cy="38" r="14" fill={TURQUESA} />
      <path d="M150 36 C170 92 146 144 100 164 C96 114 112 66 150 36 Z" fill={LIMA} />
    </svg>
  );
}

/**
 * Vito, la mascota de la marca. Vector original de la propuesta.
 *
 * Va dentro de un círculo claro tenue a propósito: su cuerpo es verde muy
 * oscuro (#0C3A2D) y sobre el fondo de la tienda (#0d1405) casi desaparecía.
 * El halo le da contraste y hace que se lea como una ilustración intencional.
 */
export function VitoMascot({ className = "h-28 w-28" }: { className?: string }) {
  return (
    <span className={`grid place-items-center rounded-full bg-white/[.06] p-4 ${className}`}>
      <svg viewBox="0 0 260 300" className="h-full w-full" role="img" aria-label="Vito, la mascota de Vitatech">
        <path d="M130 52 V28" stroke="#0C3A2D" strokeWidth={10} strokeLinecap="round" />
        <path
          d="M130 28 C128 8 148 0 166 6 C164 24 150 34 130 28 Z"
          fill={LIMA}
          stroke="#0C3A2D"
          strokeWidth={7}
          strokeLinejoin="round"
        />
        <rect x="55" y="52" width="150" height="112" rx="36" fill={LIMA} stroke="#0C3A2D" strokeWidth={10} />
        <rect x="76" y="84" width="46" height="40" rx="13" fill="#FFFFFF" stroke="#0C3A2D" strokeWidth={9} />
        <rect x="138" y="84" width="46" height="40" rx="13" fill="#FFFFFF" stroke="#0C3A2D" strokeWidth={9} />
        <path d="M122 102 H138" stroke="#0C3A2D" strokeWidth={9} />
        <circle cx="99" cy="104" r="7.5" fill="#0C3A2D" />
        <circle cx="161" cy="104" r="7.5" fill="#0C3A2D" />
        <rect x="76" y="176" width="108" height="88" rx="28" fill="#0C3A2D" />
        <path d="M104 176 L130 204 L156 176 Z" fill="#FFFFFF" />
        <path d="M130 204 L143 219 L134 254 L130 261 L126 254 L117 219 Z" fill={TURQUESA} />
      </svg>
    </span>
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
