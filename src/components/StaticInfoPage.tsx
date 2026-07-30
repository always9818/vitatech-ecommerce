import type { IconName } from "@/components/Icon";
import { Icon } from "@/components/Icon";

/**
 * Plantilla compartida para las páginas de contenido del footer (Tiendas,
 * Envíos, Garantías, Soporte, Términos). Hoy solo tienen texto de relleno;
 * cuando haya contenido real, reemplaza el arreglo `paragraphs` de cada
 * página o convierte esta plantilla para leer el texto desde la base de
 * datos si se vuelve editable desde el panel.
 */
export function StaticInfoPage({
  icon,
  title,
  subtitle,
  paragraphs,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  paragraphs: string[];
}) {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-vt-accent/[.12] text-vt-accent">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h1 className="font-heading text-[30px] font-bold text-white">{title}</h1>
      <p className="mt-2 text-[14px] text-vt-muted-1">{subtitle}</p>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-6">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-[13.5px] leading-relaxed text-vt-muted-1">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
