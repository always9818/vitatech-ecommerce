import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function TiendasPage() {
  return (
    <StaticInfoPage
      icon="clock"
      title="Nuestras tiendas"
      subtitle="Próximamente, cerca de ti."
      paragraphs={[
        "Estamos preparando nuestros primeros kioscos VITATECH, donde podrás conocer los productos en persona y recoger tus pedidos.",
        "Por ahora seguimos siendo 100% en línea. Mantente pendiente de nuestras noticias y redes sociales: ahí anunciaremos ubicaciones y horarios en cuanto estén listos.",
      ]}
    />
  );
}
