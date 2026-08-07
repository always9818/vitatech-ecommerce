/**
 * Genera un PNG de Vito para usar en correos.
 *
 * `VitoMascot` en `src/components/Logo.tsx` es un SVG de React — perfecto para
 * la web, pero los clientes de correo (Outlook sobre todo, y buena parte de
 * Gmail) no renderizan `<svg>` de forma confiable dentro de un mensaje. La
 * salida universal es una imagen rasterizada servida como archivo estático.
 *
 * Usa los MISMOS paths que `VitoMascot` — si el diseño de Vito cambia ahí,
 * hay que volver a correr este script para que el correo no se desactualice.
 * `sharp` no es una dependencia del proyecto (llegó de forma transitiva, ver
 * package-lock.json); solo hace falta para generar este archivo una vez, no
 * en cada build. Si `npm install` la quita en el futuro, instalarla aparte
 * (`npm i -D sharp`) alcanza para volver a correr el script.
 *
 * Uso:  node scripts/generar-vito-email.mjs
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const LIMA = "#A5D71E";
const OSCURO = "#0C3A2D";
const TURQUESA = "#16B5A0";

// Círculo de fondo claro detrás de Vito: en la web va sobre el fondo oscuro de
// la tienda con un halo tenue de blanco; en un correo, que casi siempre se lee
// sobre blanco, un tinte suave de la marca lo enmarca sin perder contraste.
const svg = `
<svg width="480" height="480" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg">
  <circle cx="240" cy="240" r="220" fill="#F1F8E0" />
  <g transform="translate(110, 90)">
    <path d="M130 52 V28" stroke="${OSCURO}" stroke-width="10" stroke-linecap="round" />
    <path
      d="M130 28 C128 8 148 0 166 6 C164 24 150 34 130 28 Z"
      fill="${LIMA}"
      stroke="${OSCURO}"
      stroke-width="7"
      stroke-linejoin="round"
    />
    <rect x="55" y="52" width="150" height="112" rx="36" fill="${LIMA}" stroke="${OSCURO}" stroke-width="10" />
    <rect x="76" y="84" width="46" height="40" rx="13" fill="#FFFFFF" stroke="${OSCURO}" stroke-width="9" />
    <rect x="138" y="84" width="46" height="40" rx="13" fill="#FFFFFF" stroke="${OSCURO}" stroke-width="9" />
    <path d="M122 102 H138" stroke="${OSCURO}" stroke-width="9" />
    <circle cx="99" cy="104" r="7.5" fill="${OSCURO}" />
    <circle cx="161" cy="104" r="7.5" fill="${OSCURO}" />
    <rect x="76" y="176" width="108" height="88" rx="28" fill="${OSCURO}" />
    <path d="M104 176 L130 204 L156 176 Z" fill="#FFFFFF" />
    <path d="M130 204 L143 219 L134 254 L130 261 L126 254 L117 219 Z" fill="${TURQUESA}" />
  </g>
</svg>
`;

const outPath = new URL("../public/vito-mascota.png", import.meta.url);
const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(outPath, buffer);
console.log(`Generado: ${outPath.pathname} (${buffer.length} bytes)`);
