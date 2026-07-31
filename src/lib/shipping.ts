/** Reglas de costo de envío, compartidas por el checkout y su resumen. */
export const FREE_SHIPPING_THRESHOLD = 299;
export const SHIPPING_COST = 70;

export function shippingCostFor(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

/** Los 22 departamentos de Guatemala, para el selector de envío. */
export const DEPARTAMENTOS = [
  "Alta Verapaz",
  "Baja Verapaz",
  "Chimaltenango",
  "Chiquimula",
  "El Progreso",
  "Escuintla",
  "Guatemala",
  "Huehuetenango",
  "Izabal",
  "Jalapa",
  "Jutiapa",
  "Petén",
  "Quetzaltenango",
  "Quiché",
  "Retalhuleu",
  "Sacatepéquez",
  "San Marcos",
  "Santa Rosa",
  "Sololá",
  "Suchitepéquez",
  "Totonicapán",
  "Zacapa",
] as const;

export type ShippingInput = {
  recipientName: string;
  phone: string;
  department: string;
  municipality: string;
  addressLine: string;
  zone: string;
  reference: string;
};

export const EMPTY_SHIPPING: ShippingInput = {
  recipientName: "",
  phone: "",
  department: "",
  municipality: "",
  addressLine: "",
  zone: "",
  reference: "",
};

/** Lee los campos de envío de un FormData y les quita espacios sobrantes. */
export function readShippingInput(formData: FormData): ShippingInput {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  return {
    recipientName: get("recipientName"),
    phone: get("phone"),
    department: get("department"),
    municipality: get("municipality"),
    addressLine: get("addressLine"),
    zone: get("zone"),
    reference: get("reference"),
  };
}

/**
 * Valida la dirección. Devuelve el mensaje de error o null si está bien.
 * Se usa igual en el checkout y al guardar el perfil, para que las reglas no
 * se dupliquen ni se desincronicen.
 */
export function validateShipping(input: ShippingInput): string | null {
  if (!input.recipientName) return "Escribe el nombre de quien recibe el pedido.";

  // Guatemala usa 8 dígitos. Aceptamos espacios y guiones, y el prefijo +502.
  const digits = input.phone.replace(/[\s\-()]/g, "").replace(/^\+?502/, "");
  if (!/^\d{8}$/.test(digits)) {
    return "El teléfono debe tener 8 dígitos (por ejemplo 5555 4444).";
  }

  if (!DEPARTAMENTOS.includes(input.department as (typeof DEPARTAMENTOS)[number])) {
    return "Selecciona un departamento.";
  }
  if (!input.municipality) return "Escribe el municipio.";
  if (input.addressLine.length < 8) {
    return "Escribe la dirección completa (calle o avenida y número de casa).";
  }
  return null;
}

/** Arma la dirección en una sola línea legible, como se escribe en Guatemala. */
export function formatShipping(parts: {
  addressLine?: string | null;
  zone?: string | null;
  municipality?: string | null;
  department?: string | null;
}): string {
  const bits = [
    parts.addressLine,
    parts.zone ? `zona ${parts.zone}` : null,
    parts.municipality,
    parts.department,
  ].filter(Boolean);
  return bits.join(", ");
}

/** Igual que `formatShipping`, pero para los campos congelados en una Order. */
export function formatOrderShipping(order: {
  shipAddressLine?: string | null;
  shipZone?: string | null;
  shipMunicipality?: string | null;
  shipDepartment?: string | null;
}): string {
  return formatShipping({
    addressLine: order.shipAddressLine,
    zone: order.shipZone,
    municipality: order.shipMunicipality,
    department: order.shipDepartment,
  });
}
