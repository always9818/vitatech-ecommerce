import { StaticInfoPage } from "@/components/StaticInfoPage";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Envíos",
  description: "Envío con costo fijo de Q25, gratis desde Q299. Entregas a nivel nacional en Guatemala a través de GUATEX.",
  path: "/envios",
});

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
