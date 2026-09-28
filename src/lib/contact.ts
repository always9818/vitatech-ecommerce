/**
 * Reglas del formulario de contacto, compartidas por el formulario (para
 * ofrecer los motivos y los límites) y por la acción del servidor (que es la
 * que de verdad valida: todo lo que llega del navegador se puede falsificar).
 *
 * Vive aparte y SIN "use server" a propósito: todo lo que se exporta de un
 * módulo "use server" es un endpoint público.
 */
import type { MensajeContacto } from "@/lib/email";

export const MOTIVOS_CONTACTO = [
  "Consulta sobre un producto",
  "Estado de mi pedido",
  "Garantía o devolución",
  "Compras al por mayor",
  "Otro",
] as const;

export const LIMITES_CONTACTO = {
  nombre: { min: 2, max: 80 },
  correo: { max: 120 },
  mensaje: { min: 10, max: 2000 },
} as const;

/** Menos que esto entre que se dibujó el formulario y se envió = un bot. */
export const SEGUNDOS_MINIMOS_CONTACTO = 3;

export type CampoContacto = keyof MensajeContacto;

export type ContactoFormState = {
  ok?: boolean;
  error?: string;
  errores?: Partial<Record<CampoContacto, string>>;
};

// Deliberadamente simple: algo@algo.algo, sin espacios. La única prueba real
// de que un correo existe es escribirle, y un regex "completo" rechaza
// direcciones válidas.
const CORREO_RE = /^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[a-z]{2,}$/i;

function texto(formData: FormData, campo: string) {
  const v = formData.get(campo);
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Normaliza y valida. Devuelve el mensaje limpio o los errores por campo, en
 * el tono de la tienda.
 */
export function validarContacto(
  formData: FormData,
): { ok: true; datos: MensajeContacto } | { ok: false; errores: Partial<Record<CampoContacto, string>> } {
  // Espacios repetidos fuera; los saltos de línea del mensaje sí se conservan.
  const nombre = texto(formData, "nombre").replace(/\s+/g, " ");
  const correo = texto(formData, "correo").toLowerCase();
  const telefonoCrudo = texto(formData, "telefono");
  const motivo = texto(formData, "motivo");
  const mensaje = texto(formData, "mensaje").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  const errores: Partial<Record<CampoContacto, string>> = {};

  if (nombre.length < LIMITES_CONTACTO.nombre.min) errores.nombre = "Escribe tu nombre.";
  else if (nombre.length > LIMITES_CONTACTO.nombre.max) errores.nombre = "El nombre es demasiado largo.";

  if (!correo) errores.correo = "Escribe tu correo para poder responderte.";
  else if (correo.length > LIMITES_CONTACTO.correo.max || !CORREO_RE.test(correo))
    errores.correo = "Revisa el correo: parece que le falta algo.";

  // Guatemala: 8 dígitos, opcionalmente con +502 delante. Opcional.
  let telefono = "";
  if (telefonoCrudo) {
    const digitos = telefonoCrudo.replace(/\D/g, "").replace(/^502(?=\d{8}$)/, "");
    if (!/^\d{8}$/.test(digitos)) errores.telefono = "Usa un número de 8 dígitos, por ejemplo 5335-3561.";
    else telefono = `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
  }

  if (!(MOTIVOS_CONTACTO as readonly string[]).includes(motivo)) errores.motivo = "Elige un motivo.";

  if (mensaje.length < LIMITES_CONTACTO.mensaje.min)
    errores.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
  else if (mensaje.length > LIMITES_CONTACTO.mensaje.max)
    errores.mensaje = `El mensaje pasa de ${LIMITES_CONTACTO.mensaje.max} caracteres.`;

  if (Object.keys(errores).length > 0) return { ok: false, errores };
  return { ok: true, datos: { nombre, correo, telefono, motivo, mensaje } };
}

/**
 * Trampas para bots. `sitio_web` es un campo invisible que una persona nunca
 * llena; `t` es el momento en que se dibujó el formulario. Ninguna es
 * infalible (un bot dedicado las esquiva), pero frenan a los que rellenan todo
 * lo que encuentran — que son casi todos.
 */
export function pareceBot(formData: FormData, ahora = Date.now()) {
  if (texto(formData, "sitio_web")) return true;
  const t = Number(texto(formData, "t"));
  if (!Number.isFinite(t) || t <= 0) return true;
  return ahora - t < SEGUNDOS_MINIMOS_CONTACTO * 1000;
}
