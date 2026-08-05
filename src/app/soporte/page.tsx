import { StaticInfoPage } from "@/components/StaticInfoPage";

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
