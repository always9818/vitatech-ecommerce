import { getSiteSettings } from "@/lib/site-settings";
import { HeroImageForm } from "@/components/admin/HeroImageForm";

export default async function AdminHeroPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Imagen de portada</h1>
      <p className="mt-2 max-w-xl text-[13.5px] text-vt-muted-1">
        Esta es la foto grande a la derecha del hero de la home. Si no subes ninguna, se muestra el
        ícono de laptop por defecto.
      </p>

      <div className="mt-6 max-w-md">
        <HeroImageForm currentImage={settings?.heroImageUrl ?? undefined} />
      </div>
    </div>
  );
}
