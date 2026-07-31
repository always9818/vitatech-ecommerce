import Link from "next/link";
import { VitatechLetterV } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-4 text-center">
        <div className="font-heading text-[19px] font-bold text-white">
          <VitatechLetterV />
          ITA<span className="text-vt-accent">TECH</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-5 text-[13px] text-vt-muted-1">
          <Link href="/tiendas" className="hover:text-vt-accent">
            Tiendas
          </Link>
          <Link href="/envios" className="hover:text-vt-accent">
            Envíos
          </Link>
          <Link href="/garantias" className="hover:text-vt-accent">
            Garantías
          </Link>
          <Link href="/soporte" className="hover:text-vt-accent">
            Soporte
          </Link>
          <Link href="/terminos" className="hover:text-vt-accent">
            Términos
          </Link>
        </nav>
        <div className="text-[12px] text-vt-muted-3">
          © {new Date().getFullYear()} Importadora Vitatech. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
