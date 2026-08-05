import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function EnviosPage() {
  return (
    <StaticInfoPage
      icon="truck"
      title="Envíos"
      subtitle="Cómo y cuándo llega tu pedido."
      paragraphs={[
        "El envío tiene un costo fijo de Q 25. En compras desde Q 299 el envío es gratis.",
        "Todos nuestros envíos se realizan a nivel nacional a través de GUATEX.",
      ]}
    />
  );
}
