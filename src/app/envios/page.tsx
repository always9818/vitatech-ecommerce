import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function EnviosPage() {
  return (
    <StaticInfoPage
      icon="truck"
      title="Envíos"
      subtitle="Cómo y cuándo llega tu pedido."
      paragraphs={[
        "Envío gratis en compras desde Q 299; por debajo de ese monto aplica un costo fijo de envío.",
        "Aquí puedes detallar tiempos de entrega por zona, empresas de paquetería y cómo rastrear un pedido.",
        "Contenido de ejemplo — reemplázalo con tu política real de envíos.",
      ]}
    />
  );
}
