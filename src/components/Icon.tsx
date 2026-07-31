/* Iconos de línea estilo Notion/Lucide: viewBox 24x24, trazo 1.75, sin
   relleno, esquinas redondeadas y color heredado del texto
   (stroke="currentColor"), para que se adapten solos a cada contexto.
   Mismas convenciones que el set de iconos usado en los demás proyectos.

   Para agregar uno nuevo: toma cualquier icono de línea 24x24 (estilo
   Lucide) y pega solo su contenido interno, sin la etiqueta <svg>. */

const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  cart: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h2.5l2.4 12.1a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L21 7H5.2" /></>,
  truck: <><path d="M14 17V6a1 1 0 0 0-1-1H2v11a1 1 0 0 0 1 1h1" /><path d="M14 9h4l3 3.5V17a1 1 0 0 1-1 1h-1" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /><path d="M9 18h6" /></>,
  store: <><path d="M3 9.5 4.6 4.7A1 1 0 0 1 5.6 4h12.8a1 1 0 0 1 1 .7L21 9.5" /><path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /><path d="M5 12.5V20h14v-7.5" /><path d="M9.5 20v-4.5h5V20" /></>,
  shield: <><path d="M12 22s8-4 8-10V5.5l-8-3-8 3V12c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M6 15h4" /></>,
  returns: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 3v6h6" /></>,
  laptop: <><rect x="3" y="5" width="18" height="11" rx="2" /><path d="M2 20h20" /></>,
  smartphone: <><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18.5h2" /></>,
  monitor: <><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></>,
  headphones: <><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><path d="M4 15.5a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2Z" /><path d="M20 15.5a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2Z" /></>,
  keyboard: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01" /><path d="M10 10h.01" /><path d="M14 10h.01" /><path d="M18 10h.01" /><path d="M8 14h8" /></>,
  printer: <><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 15h12v6H6z" /></>,
  speaker: <><rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="15" r="3.5" /><path d="M12 6h.01" /></>,
  mouse: <><rect x="6" y="2" width="12" height="20" rx="6" /><path d="M12 7v3" /></>,
  tablet: <><rect x="4" y="2" width="16" height="20" rx="2.5" /><path d="M11 18.5h2" /></>,
  package: <><path d="M21 8 12 3 3 8v8l9 5 9-5Z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L6 21" /></>,
  check: <><path d="M20 6 9 17l-5-5" /></>,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  xCircle: <><circle cx="12" cy="12" r="9" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  star: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9Z" /></>,
  plus: <><path d="M5 12h14" /><path d="M12 5v14" /></>,
  minus: <><path d="M5 12h14" /></>,
  chat: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z" /></>,
  document: <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v5h5" /><path d="M8 13h8" /><path d="M8 17h5" /></>,
  chevronLeft: <><path d="M15 18 9 12l6-6" /></>,
  chevronRight: <><path d="m9 18 6-6-6-6" /></>,
} as const;

export type IconName = keyof typeof PATHS;

/** Indicador de carga para botones que disparan una acción en el servidor. */
export function Spinner({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} animate-spin`}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2.5} opacity={0.25} />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Logo oficial de Google. NO pertenece al set de iconos de línea: las guías de
 * marca de Google exigen la "G" con sus cuatro colores originales, así que es
 * la única excepción a la regla de "todo con currentColor".
 */
export function GoogleMark({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

export function Icon({
  name,
  className = "h-5 w-5",
  filled = false,
}: {
  name: IconName;
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
