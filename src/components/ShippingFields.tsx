"use client";

import { useEffect, useState } from "react";
import { DEPARTAMENTOS } from "@/lib/shipping";

export type ShippingDefaults = {
  recipientName?: string | null;
  phone?: string | null;
  department?: string | null;
  municipality?: string | null;
  addressLine?: string | null;
  zone?: string | null;
  reference?: string | null;
};

const inputClass =
  "w-full rounded-[10px] border border-white/10 bg-white/[.05] px-4 py-2.5 text-sm text-vt-fg placeholder:text-vt-muted-2 focus:border-vt-accent/50 focus:outline-none";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-vt-fg";

/**
 * Campos de dirección compartidos por el checkout y "Mi cuenta", para que las
 * dos pantallas pidan exactamente lo mismo y no se desincronicen.
 */
export function ShippingFields({ defaults }: { defaults?: ShippingDefaults }) {
  // El departamento va controlado a propósito. Los <input> recuperan su valor
  // solo con `defaultValue`, pero un <select> no: al reiniciarse el formulario
  // tras una acción fallida quedaba en blanco y el cliente tenía que volver a
  // elegirlo. Controlado, React lo vuelve a pintar siempre con el valor bueno.
  const [department, setDepartment] = useState(defaults?.department ?? "");
  useEffect(() => {
    setDepartment(defaults?.department ?? "");
  }, [defaults?.department]);

  return (
    <div className="grid grid-cols-1 gap-5 min-[620px]:grid-cols-2">
      <div>
        <label className={labelClass}>¿Quién recibe?</label>
        <input
          name="recipientName"
          required
          defaultValue={defaults?.recipientName ?? ""}
          placeholder="Nombre y apellido"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Teléfono</label>
        <input
          name="phone"
          required
          inputMode="tel"
          defaultValue={defaults?.phone ?? ""}
          placeholder="5555 4444"
          className={inputClass}
        />
        <p className="mt-1 text-[11.5px] text-vt-muted-2">
          Para que el mensajero te ubique el día de la entrega.
        </p>
      </div>

      <div>
        <label className={labelClass}>Departamento</label>
        <select
          name="department"
          required
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Selecciona
          </option>
          {DEPARTAMENTOS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Municipio</label>
        <input
          name="municipality"
          required
          defaultValue={defaults?.municipality ?? ""}
          placeholder="Mixco"
          className={inputClass}
        />
      </div>

      <div className="min-[620px]:col-span-2">
        <label className={labelClass}>Dirección</label>
        <input
          name="addressLine"
          required
          defaultValue={defaults?.addressLine ?? ""}
          placeholder="5a calle 4-32, colonia El Rosario"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Zona <span className="font-normal text-vt-muted-2">(opcional)</span>
        </label>
        <input
          name="zone"
          defaultValue={defaults?.zone ?? ""}
          placeholder="10"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Punto de referencia <span className="font-normal text-vt-muted-2">(opcional)</span>
        </label>
        <input
          name="reference"
          defaultValue={defaults?.reference ?? ""}
          placeholder="Portón negro, frente a la tienda"
          className={inputClass}
        />
      </div>
    </div>
  );
}
