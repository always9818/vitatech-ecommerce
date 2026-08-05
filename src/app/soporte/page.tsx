import { StaticInfoPage } from "@/components/StaticInfoPage";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Soporte",
  description: "Escríbenos por WhatsApp o correo. Atendemos de lunes a sábado, de 9:00 a. m. a 6:00 p. m.",
  path: "/soporte",
});

export default function SoportePage() {
  return (
    <StaticInfoPage
      icon="chat"
      title="Soporte"
      subtitle="¿Necesitas ayuda? Estamos para servirte."
      paragraphs={[
        "WhatsApp: +502 5335-3561.",
        "Correo electrónico: info@importacionesvitatech.com.",
        "Horario de atención: lunes a sábado, de 9:00 a. m. a 6:00 p. m.",
        "Todos nuestros envíos se realizan a través de GUATEX.",
      ]}
    />
  );
}
