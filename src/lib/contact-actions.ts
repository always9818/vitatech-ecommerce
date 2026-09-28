"use server";

import { pareceBot, validarContacto, type ContactoFormState } from "@/lib/contact";
import { sendContactMessageEmail } from "@/lib/email";

/**
 * Único endpoint del formulario de contacto. No pide sesión: cualquiera debe
 * poder escribirle a la tienda. Por eso mismo no toca la base ni confía en
 * nada de lo que llega — valida todo aquí y solo manda un correo a la bandeja
 * fija de la tienda (nunca a una dirección elegida por el visitante).
 */
export async function enviarMensajeContacto(formData: FormData): Promise<ContactoFormState> {
  // A un bot se le responde "enviado" para que no aprenda a esquivar la
  // trampa, pero no se manda nada.
  if (pareceBot(formData)) {
    console.warn("[contacto] envío descartado por las trampas anti-bot");
    return { ok: true };
  }

  const resultado = validarContacto(formData);
  if (!resultado.ok) {
    return { error: "Revisa los campos marcados.", errores: resultado.errores };
  }

  const enviado = await sendContactMessageEmail(resultado.datos);
  if (!enviado) {
    return {
      error:
        "No pudimos enviar tu mensaje en este momento. Inténtalo de nuevo en unos minutos o escríbenos por WhatsApp.",
    };
  }
  return { ok: true };
}
