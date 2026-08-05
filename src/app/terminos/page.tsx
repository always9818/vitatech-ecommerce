import { Icon } from "@/components/Icon";

/**
 * A diferencia de las otras páginas del footer (Tiendas, Envíos, Garantías,
 * Soporte), este documento necesita secciones con encabezado propio en vez
 * de párrafos sueltos, así que no reutiliza `StaticInfoPage`.
 */
const SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "1. Aceptación de los términos",
    paragraphs: [
      "Al acceder al sitio importadoravitatech.com (en adelante, «el Sitio») y realizar una compra, usted acepta íntegramente estos Términos y Condiciones. Si no está de acuerdo con alguno de sus puntos, le pedimos abstenerse de utilizar el Sitio.",
    ],
  },
  {
    heading: "2. Identificación del vendedor",
    paragraphs: [
      "El Sitio es operado por Importadora Vitatech («VITATECH»), negocio dedicado a la venta de tecnología y accesorios electrónicos, con domicilio y operaciones en la República de Guatemala. Puede contactarnos por los medios indicados en la sección «Contacto» de estos Términos.",
    ],
  },
  {
    heading: "3. Productos, precios y disponibilidad",
    paragraphs: [
      "Los precios publicados en el Sitio están expresados en quetzales (Q) e incluyen los impuestos aplicables, salvo que se indique lo contrario. VITATECH se reserva el derecho de modificar precios, descripciones y disponibilidad de los productos sin previo aviso, sin que ello afecte pedidos ya confirmados y pagados.",
      "Si un producto se publica con un precio o descripción visiblemente errónea, VITATECH podrá cancelar el pedido correspondiente y reembolsar el monto pagado en su totalidad.",
    ],
  },
  {
    heading: "4. Proceso de compra y pago",
    paragraphs: [
      "La compra se confirma una vez que el pago ha sido procesado y verificado a través de la pasarela de pago autorizada del Sitio. VITATECH no almacena los datos completos de tarjetas de crédito o débito de sus clientes.",
      "Si un pedido ya pagado no puede completarse por falta de existencias, VITATECH lo notificará al cliente y reembolsará el monto total pagado.",
    ],
  },
  {
    heading: "5. Envíos y entregas",
    paragraphs: [
      "Los envíos se realizan a nivel nacional a través de GUATEX. El costo y el tiempo estimado de entrega dependen del destino y se muestran al cliente antes de confirmar la compra.",
      "VITATECH no se hace responsable por retrasos atribuibles a la empresa transportista, desastres naturales, huelgas u otras causas de fuerza mayor, aunque hará su mejor esfuerzo por mantener informado al cliente sobre el estado de su envío.",
    ],
  },
  {
    heading: "6. Garantías y devoluciones",
    paragraphs: [
      "Todos los productos cuentan con garantía contra desperfectos de fábrica: 48 horas a partir de la entrega para cables y accesorios de conexión, y 30 días a partir de la entrega para productos electrónicos (laptops, celulares, monitores, audio y equipos similares).",
      "La garantía no cubre daños ocasionados por mal uso, golpes, humedad, manipulación indebida o modificaciones realizadas por el cliente. Para hacerla válida, el cliente debe contactar a VITATECH dentro del plazo correspondiente y presentar su comprobante de compra.",
    ],
  },
  {
    heading: "7. Cuentas de usuario",
    paragraphs: [
      "El cliente puede crear una cuenta en el Sitio para agilizar sus compras. Es responsable de mantener la confidencialidad de sus credenciales de acceso y de toda actividad realizada desde su cuenta. VITATECH podrá suspender o cancelar cuentas que incumplan estos Términos o que se utilicen de forma fraudulenta.",
    ],
  },
  {
    heading: "8. Propiedad intelectual",
    paragraphs: [
      "Los contenidos del Sitio —textos, imágenes, logotipos, marca VITATECH y diseño— son propiedad de Importadora Vitatech o se utilizan bajo la autorización correspondiente, y están protegidos por la legislación de propiedad intelectual aplicable en Guatemala. Queda prohibida su reproducción total o parcial sin autorización previa y por escrito.",
    ],
  },
  {
    heading: "9. Protección de datos personales",
    paragraphs: [
      "VITATECH recopila únicamente los datos personales necesarios para procesar pedidos, gestionar cuentas de usuario y brindar soporte (nombre, dirección, teléfono, correo electrónico). Estos datos no se venden ni se comparten con terceros, salvo con los proveedores estrictamente necesarios para completar la compra, como la pasarela de pago y la empresa de transporte.",
      "El cliente puede solicitar la actualización o eliminación de sus datos personales escribiendo a los canales de contacto indicados en estos Términos.",
    ],
  },
  {
    heading: "10. Limitación de responsabilidad",
    paragraphs: [
      "VITATECH no será responsable por daños indirectos, pérdida de datos o lucro cesante derivados del uso del Sitio o de los productos adquiridos, salvo en los casos en que la ley aplicable no permita dicha limitación. La responsabilidad total de VITATECH frente al cliente, en cualquier caso, no excederá el monto efectivamente pagado por el producto o servicio en cuestión.",
    ],
  },
  {
    heading: "11. Modificaciones a estos Términos",
    paragraphs: [
      "VITATECH podrá actualizar estos Términos y Condiciones en cualquier momento para reflejar cambios en sus operaciones o en la legislación aplicable. La versión vigente será siempre la publicada en el Sitio. El uso continuado del Sitio después de una actualización implica la aceptación de los nuevos Términos.",
    ],
  },
  {
    heading: "12. Ley aplicable y jurisdicción",
    paragraphs: [
      "Estos Términos y Condiciones se rigen por las leyes de la República de Guatemala. Cualquier controversia derivada de su interpretación o cumplimiento se someterá a los tribunales competentes de Guatemala, sin perjuicio de los derechos que la legislación de protección al consumidor reconozca al cliente.",
    ],
  },
  {
    heading: "13. Contacto",
    paragraphs: [
      "Para cualquier duda, aclaración o reclamo relacionado con estos Términos, puede escribirnos por WhatsApp al +502 5335-3561 o al correo info@importacionesvitatech.com, en nuestro horario de atención: lunes a sábado, de 9:00 a. m. a 6:00 p. m.",
    ],
  },
];

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-vt-accent/[.12] text-vt-accent">
        <Icon name="document" className="h-6 w-6" />
      </span>
      <h1 className="font-heading text-[30px] font-bold text-white">Términos y condiciones</h1>
      <p className="mt-2 text-[14px] text-vt-muted-1">Las reglas de uso de la tienda VITATECH.</p>

      <div className="mt-8 flex flex-col divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[.03]">
        {SECTIONS.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2 p-6">
            <h2 className="font-heading text-[15px] font-bold text-vt-accent">{section.heading}</h2>
            {section.paragraphs.map((p, i) => (
              <p key={i} className="text-[13.5px] leading-relaxed text-vt-muted-1">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
