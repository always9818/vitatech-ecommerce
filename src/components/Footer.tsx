import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-4 text-center">
        <div className="font-heading text-[17px] font-bold text-white">
          VITA<span className="text-vt-accent">TECH</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-5 text-[13px] text-vt-muted-1">
          <Link href="#">Tiendas</Link>
          <Link href="#">Envíos</Link>
          <Link href="#">Garantías</Link>
          <Link href="#">Soporte</Link>
          <Link href="#">Términos</Link>
        </nav>
        <div className="text-[12px] text-vt-muted-3">
          © {new Date().getFullYear()} Importadora Vitatech. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
