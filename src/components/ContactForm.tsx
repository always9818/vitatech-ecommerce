"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { enviarMensajeContacto } from "@/lib/contact-actions";
import {
  LIMITES_CONTACTO,
  MOTIVOS_CONTACTO,
  validarContacto,
  type CampoContacto,
  type ContactoFormState,
} from "@/lib/contact";
import { Icon, Spinner } from "@/components/Icon";

const inputClass =
  "w-full rounded-[10px] border bg-white/[.05] px-4 py-2.5 text-sm text-vt-fg placeholder:text-vt-muted-2 transition-colors focus:outline-none";
const bordeNormal = "border-white/10 focus:border-vt-accent/50";
const bordeError = "border-vt-error/60 focus:border-vt-error";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-vt-fg";

export function ContactForm({ defaults }: { defaults?: { nombre?: string; correo?: string } }) {
  const [state, setState] = useState<ContactoFormState>({});
  const [largo, setLargo] = useState(0);
  const [isPending, startTransition] = useTransition();
  const montadoEn = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    montadoEn.current = Date.now();
  }, []);

  const errores = state.errores ?? {};
  const campo = (nombre: CampoContacto) => ({
    id: `contacto-${nombre}`,
    name: nombre,
    "aria-invalid": errores[nombre] ? true : undefined,
    "aria-describedby": errores[nombre] ? `contacto-${nombre}-error` : undefined,
    className: `${inputClass} ${errores[nombre] ? bordeError : bordeNormal}`,
    // Al corregir un campo se le quita el aviso, sin esperar a reenviar.
    onChange: () => {
      if (errores[nombre]) setState((s) => ({ ...s, errores: { ...s.errores, [nombre]: undefined } }));
    },
  });

  if (state.ok) {
    return (
      <div className="animate-vt-pop flex flex-col items-center gap-4 rounded-3xl border border-vt-accent/30 bg-vt-accent/[.06] px-6 py-12 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-vt-accent/[.15] text-vt-accent">
          <Icon name="checkCircle" className="h-9 w-9" />
        </span>
        <h2 className="font-heading text-[22px] font-bold text-white">¡Mensaje enviado!</h2>
        <p className="max-w-[380px] text-[14px] leading-relaxed text-vt-muted-1">
          Te responderemos al correo que nos dejaste, normalmente en menos de un día hábil. Revisa también tu
          carpeta de spam.
        </p>
        <button
          type="button"
          onClick={() => {
            setState({});
            setLargo(0);
            montadoEn.current = Date.now();
          }}
          className="vt-btn mt-2 rounded-[10px] border border-white/20 px-5 py-2.5 text-sm font-semibold text-vt-fg hover:border-vt-accent hover:text-vt-accent"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      noValidate
      // onSubmit + useTransition y no `action={...}`: React 19 reinicia los
      // campos al terminar una acción de formulario y el cliente perdería lo
      // que escribió si algo falla (ver ShippingProfileForm).
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set("t", String(montadoEn.current));

        // Primero en el navegador, para responder al instante. El servidor
        // vuelve a validar todo: esto es solo comodidad.
        const local = validarContacto(formData);
        if (!local.ok) {
          setState({ error: "Revisa los campos marcados.", errores: local.errores });
          const primero = Object.keys(local.errores)[0];
          formRef.current?.querySelector<HTMLElement>(`#contacto-${primero}`)?.focus();
          return;
        }

        startTransition(async () => {
          try {
            setState(await enviarMensajeContacto(formData));
          } catch {
            setState({ error: "Se perdió la conexión. Revisa tu internet e inténtalo otra vez." });
          }
        });
      }}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-5 min-[620px]:grid-cols-2">
        <div>
          <label htmlFor="contacto-nombre" className={labelClass}>
            Nombre
          </label>
          <input
            {...campo("nombre")}
            type="text"
            autoComplete="name"
            maxLength={LIMITES_CONTACTO.nombre.max}
            defaultValue={defaults?.nombre}
            placeholder="¿Cómo te llamas?"
          />
          <ErrorCampo campo="nombre" error={errores.nombre} />
        </div>
        <div>
          <label htmlFor="contacto-correo" className={labelClass}>
            Correo electrónico
          </label>
          <input
            {...campo("correo")}
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={LIMITES_CONTACTO.correo.max}
            defaultValue={defaults?.correo}
            placeholder="tu@correo.com"
          />
          <ErrorCampo campo="correo" error={errores.correo} />
        </div>
        <div>
          <label htmlFor="contacto-telefono" className={labelClass}>
            Teléfono <span className="font-normal text-vt-muted-2">(opcional)</span>
          </label>
          <input
            {...campo("telefono")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder="5335-3561"
          />
          <ErrorCampo campo="telefono" error={errores.telefono} />
        </div>
        <div>
          <label htmlFor="contacto-motivo" className={labelClass}>
            Motivo
          </label>
          <select {...campo("motivo")} defaultValue="">
            <option value="" disabled>
              Elige una opción
            </option>
            {MOTIVOS_CONTACTO.map((m) => (
              <option key={m} value={m} className="bg-vt-bg">
                {m}
              </option>
            ))}
          </select>
          <ErrorCampo campo="motivo" error={errores.motivo} />
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="contacto-mensaje" className={labelClass}>
            Mensaje
          </label>
          <span
            className={`text-[11.5px] tabular-nums ${largo > LIMITES_CONTACTO.mensaje.max ? "text-vt-error" : "text-vt-muted-2"}`}
          >
            {largo}/{LIMITES_CONTACTO.mensaje.max}
          </span>
        </div>
        <textarea
          {...campo("mensaje")}
          rows={6}
          onChange={(e) => {
            setLargo(e.target.value.length);
            campo("mensaje").onChange();
          }}
          placeholder="Cuéntanos en qué te podemos ayudar. Si es sobre un pedido, incluye su número."
          className={`${campo("mensaje").className} resize-y leading-relaxed`}
        />
        <ErrorCampo campo="mensaje" error={errores.mensaje} />
      </div>

      {/* Trampa para bots: invisible para personas y lectores de pantalla. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contacto-sitio-web">No llenes este campo</label>
        <input id="contacto-sitio-web" name="sitio_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-vt-error/30 bg-vt-error/10 px-4 py-3 text-[13px] text-vt-error"
        >
          <Icon name="xCircle" className="mt-px h-[18px] w-[18px] flex-none" />
          {state.error}
        </div>
      )}

      <div className="flex flex-col-reverse items-stretch gap-3 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between">
        <p className="text-[12px] text-vt-muted-2">Solo usamos tus datos para responderte.</p>
        <button
          type="submit"
          disabled={isPending}
          className="vt-btn vt-btn-accent flex items-center justify-center gap-2 rounded-[10px] bg-vt-accent px-7 py-3 text-sm font-extrabold text-vt-accent-fg disabled:opacity-60"
        >
          {isPending ? <Spinner className="h-[18px] w-[18px]" /> : <Icon name="mail" className="h-[18px] w-[18px]" />}
          {isPending ? "Enviando..." : "Enviar mensaje"}
        </button>
      </div>
    </form>
  );
}

function ErrorCampo({ campo, error }: { campo: CampoContacto; error?: string }) {
  if (!error) return null;
  return (
    <p id={`contacto-${campo}-error`} className="mt-1.5 text-[12px] text-vt-error">
      {error}
    </p>
  );
}
