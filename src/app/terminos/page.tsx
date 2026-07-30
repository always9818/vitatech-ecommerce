import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function TerminosPage() {
  return (
    <StaticInfoPage
      icon="document"
      title="Términos y condiciones"
      subtitle="Las reglas de uso de la tienda VITATECH."
      paragraphs={[
        "Aquí va el texto legal de términos y condiciones, política de privacidad y política de devoluciones.",
        "Contenido de ejemplo — reemplázalo con el texto legal real revisado por tu asesoría correspondiente.",
      ]}
    />
  );
}
