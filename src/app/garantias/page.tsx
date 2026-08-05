import { StaticInfoPage } from "@/components/StaticInfoPage";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Garantías",
  description: "Garantía real contra desperfectos de fábrica: 48 horas en cables y accesorios, 30 días en productos electrónicos.",
  path: "/garantias",
});

export default function GarantiasPage() {
  return (
    <StaticInfoPage
      icon="shield"
      title="Garantías"
      subtitle="Cobertura y proceso de garantía de tus productos."
      paragraphs={[
        "En VITATECH respaldamos cada producto que vendemos contra desperfectos de fábrica.",
        "Cables y accesorios de conexión: garantía de 48 horas a partir de la entrega.",
        "Productos electrónicos (laptops, celulares, monitores, audio y demás equipos): garantía de 30 días a partir de la entrega.",
        "Cambios por desperfecto de fábrica: si tu producto presenta una falla de fábrica dentro del plazo de garantía, lo cambiamos por uno nuevo.",
        "La garantía cubre desperfectos de fábrica; no cubre daños por mal uso, golpes, humedad ni modificaciones al producto. Para hacerla válida, contáctanos dentro del plazo correspondiente con tu comprobante de compra.",
      ]}
    />
  );
}
