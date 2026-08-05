import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function EnviosPage() {
  return (
    <StaticInfoPage
      icon="truck"
      title="Envíos"
      subtitle="Cómo y cuándo llega tu pedido."
      paragraphs={[
        "El envío tiene un costo fijo de Q 25. En compras desde Q 299 el envío es gratis.",
        "Aquí puedes detallar tiempos de entrega por zona, empresas de paquetería y cómo rastrear un pedido.",
        "Contenido de ejemplo — reemplázalo con tu política real de envíos.",
      ]}
    />
  );
}
