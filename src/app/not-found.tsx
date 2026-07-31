import Link from "next/link";
import { VitoMascot } from "@/components/Logo";

export const metadata = { title: "Página no encontrada · VITATECH_" };

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-260px)] max-w-[560px] flex-col items-center justify-center gap-5 px-6 py-20 text-center">
      <VitoMascot className="h-32 w-32" />

      <div className="font-heading text-[52px] leading-none font-bold text-vt-accent">404</div>

      <h1 className="font-heading text-[22px] font-bold text-white">
        Vito no encontró esta página
      </h1>
      <p className="text-[14px] text-vt-muted-1">
        Puede que el enlace esté mal escrito o que el producto ya no exista.
      </p>

      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="vt-btn vt-btn-accent rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-extrabold text-vt-accent-fg"
        >
          Ir al inicio
        </Link>
        <Link
          href="/catalogo"
          className="vt-btn rounded-[10px] border border-white/[.14] px-6 py-3 text-sm font-semibold text-vt-fg hover:border-vt-accent hover:text-vt-accent"
        >
          Ver el catálogo
        </Link>
      </div>
    </div>
  );
}
