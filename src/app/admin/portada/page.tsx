import { getSiteSettings, resolveHeroContent } from "@/lib/site-settings";
import { HeroImageForm } from "@/components/admin/HeroImageForm";
import { HeroContentForm } from "@/components/admin/HeroContentForm";

export default async function AdminHeroPage() {
  const settings = await getSiteSettings();
  const content = resolveHeroContent(settings);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Portada</h1>
      <p className="mt-2 max-w-xl text-[13.5px] text-vt-muted-1">
        Lo que se ve arriba del todo en la home: los textos y la foto grande de la derecha. Los
        cambios se aplican de inmediato.
      </p>

      <div className="mt-8 max-w-2xl">
        <h2 className="font-heading text-lg font-bold text-white">Textos</h2>
        <p className="mt-1 mb-4 text-[13px] text-vt-muted-1">
          Cámbialos para anunciar una temporada, una promoción o un descuento.
        </p>
        <HeroContentForm content={content} />
      </div>

      <div className="mt-10 max-w-md">
        <h2 className="font-heading text-lg font-bold text-white">Imagen</h2>
        <p className="mt-1 mb-4 text-[13px] text-vt-muted-1">
          La foto grande a la derecha del hero. Si no subes ninguna, se muestra el ícono de laptop
          por defecto.
        </p>
        <HeroImageForm currentImage={settings?.heroImageUrl ?? undefined} />
      </div>
    </div>
  );
}
