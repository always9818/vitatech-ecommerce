import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function GarantiasPage() {
  return (
    <StaticInfoPage
      icon="shield"
      title="Garantías"
      subtitle="Cobertura y proceso de garantía de tus productos."
      paragraphs={[
        "Todos los productos incluyen garantía de fábrica; consulta los meses específicos en la ficha de cada producto.",
        "Aquí puedes detallar el proceso para hacer válida una garantía, qué cubre y qué no, y los tiempos de reparación.",
        "Contenido de ejemplo — reemplázalo con tu política real de garantías.",
      ]}
    />
  );
}
