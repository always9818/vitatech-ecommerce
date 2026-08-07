import Link from "next/link";
import { auth } from "@/auth";
import { getCart } from "@/lib/cart-actions";
import { getCategoriesWithStock } from "@/lib/catalog";
import { SearchBar } from "@/components/SearchBar";
import { CartBadge } from "@/components/CartBadge";
import { Icon } from "@/components/Icon";
import { VitatechLetterV } from "@/components/Logo";
import { DepartmentNav, type DepartmentNavItem } from "@/components/DepartmentNav";
import { DEPARTMENT_ORDER, DEPARTMENTS } from "@/lib/departments";

// Máximo de categorías por departamento en el menú, no una lista fija: antes
// "Monitores" quedó ahí con 0 productos (el cliente hacía clic y caía en "Sin
// resultados") porque nadie se acuerda de tocar este archivo cuando cambia
// el inventario. Ahora se arma solo con lo que hay stock, de mayor a menor.
const HEADER_CATEGORY_LIMIT = 6;

export async function Header() {
  const [session, items, categories] = await Promise.all([auth(), getCart(), getCategoriesWithStock()]);
  const cartCount = items.reduce((a, it) => a + it.quantity, 0);

  // Un departamento sin nada que vender no se anuncia: mientras no haya
  // suplementos cargados, "Salud y Bienestar" simplemente no aparece, en vez
  // de mandar al cliente a una sección vacía.
  const departamentos: DepartmentNavItem[] = DEPARTMENT_ORDER.map((department) => ({
    department,
    categories: categories
      .filter((c) => c.department === department)
      .slice(0, HEADER_CATEGORY_LIMIT)
      .map((c) => ({ id: c.id, name: c.name })),
  })).filter((d) => d.categories.length > 0);

  return (
    <header className="sticky top-0 z-40 border-b border-vt-accent/[.14] bg-[rgba(13,20,5,.92)] backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-3.5 py-3.5 min-[520px]:gap-4 min-[520px]:px-6 min-[880px]:gap-6">
        <Link
          href="/"
          aria-label="Importadora Vitatech, ir al inicio"
          className="flex-none font-heading text-[18px] font-bold whitespace-nowrap text-white min-[520px]:text-[22px]"
        >
          <VitatechLetterV />
          ITA<span className="text-vt-accent">TECH_</span>
        </Link>

        <div className="min-w-0 flex-1 min-[880px]:max-w-[420px]">
          <SearchBar />
        </div>

        <nav className="hidden min-[881px]:block">
          <DepartmentNav items={departamentos} />
        </nav>

        <div className="flex flex-none items-center gap-2 min-[520px]:gap-3">
          <Link
            href={session ? "/cuenta" : "/login"}
            className="grid h-9 w-9 flex-none place-items-center rounded-full border border-white/10 text-vt-fg transition-colors hover:border-vt-accent/50 hover:text-vt-accent min-[520px]:h-10 min-[520px]:w-10"
            aria-label="Cuenta"
          >
            <Icon name="user" className="h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/carrito"
            className="relative grid h-9 w-9 flex-none place-items-center rounded-full bg-vt-accent text-vt-accent-fg min-[520px]:h-10 min-[520px]:w-10"
            aria-label="Carrito"
          >
            <Icon name="cart" className="h-[18px] w-[18px]" />
            <CartBadge count={cartCount} />
          </Link>
        </div>
      </div>

      {/* En móvil el menú de arriba no cabe y queda oculto. Sin esta fila, un
          departamento entero sería inalcanzable desde el celular — que es por
          donde entra la mayoría de los clientes. Son enlaces directos al
          catálogo de cada departamento, sin desplegable. */}
      {departamentos.length > 1 && (
        <nav className="min-[881px]:hidden border-t border-white/[.07]">
          <div className="mx-auto flex max-w-[1180px] items-stretch px-3.5 min-[520px]:px-6">
            {departamentos.map(({ department }) => {
              const info = DEPARTMENTS[department];
              return (
                <Link
                  key={department}
                  href={`/catalogo?dept=${info.slug}`}
                  className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12.5px] font-bold text-vt-fg"
                >
                  <Icon name={info.icon} className="h-4 w-4 text-vt-accent" />
                  {info.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
