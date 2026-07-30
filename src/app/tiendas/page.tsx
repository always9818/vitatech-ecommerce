import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function TiendasPage() {
  return (
    <StaticInfoPage
      icon="store"
      title="Nuestras tiendas"
      subtitle="Encuéntranos y recoge tu pedido en persona."
      paragraphs={[
        "Aquí va el listado de sucursales de VITATECH: dirección, horario y teléfono de cada tienda.",
        "Contenido de ejemplo — reemplázalo con la información real de tus sucursales.",
      ]}
    />
  );
}
