import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function SoportePage() {
  return (
    <StaticInfoPage
      icon="chat"
      title="Soporte"
      subtitle="¿Necesitas ayuda? Estamos para servirte."
      paragraphs={[
        "Aquí puedes agregar tus canales de contacto: WhatsApp, correo, teléfono, y horario de atención.",
        "También puedes incluir preguntas frecuentes sobre pedidos, pagos y devoluciones.",
        "Contenido de ejemplo — reemplázalo con tu información real de soporte.",
      ]}
    />
  );
}
