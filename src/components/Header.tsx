import Link from "next/link";
import { auth } from "@/auth";
import { getCart } from "@/lib/cart-actions";
import { SearchBar } from "@/components/SearchBar";
import { CartBadge } from "@/components/CartBadge";

const HEADER_CATEGORIES = ["Laptops", "Celulares", "Monitores", "Audio"];

export async function Header() {
  const session = await auth();
  const items = await getCart();
  const cartCount = items.reduce((a, it) => a + it.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-vt-accent/[.14] bg-[rgba(13,20,5,.92)] backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-3.5 py-3.5 min-[520px]:gap-4 min-[520px]:px-6 min-[880px]:gap-6">
        <Link
          href="/"
          className="flex-none font-heading text-[18px] font-bold whitespace-nowrap text-white min-[520px]:text-[22px]"
        >
          VITA<span className="text-vt-accent">TECH_</span>
        </Link>

        <div className="min-w-0 flex-1 min-[880px]:max-w-[420px]">
          <SearchBar />
        </div>

        <nav className="hidden min-[881px]:flex items-center gap-1 text-[13.5px] font-semibold text-vt-fg">
          {HEADER_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/catalogo?cat=${encodeURIComponent(c)}`}
              className="rounded-lg px-3 py-2 hover:text-vt-accent"
            >
              {c}
            </Link>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-2 min-[520px]:gap-3">
          <Link
            href={session ? "/cuenta" : "/login"}
            className="grid h-9 w-9 flex-none place-items-center rounded-full border border-white/10 text-base min-[520px]:h-10 min-[520px]:w-10 min-[520px]:text-lg"
            aria-label="Cuenta"
          >
            👤
          </Link>
          <Link
            href="/carrito"
            className="relative grid h-9 w-9 flex-none place-items-center rounded-full bg-vt-accent text-base min-[520px]:h-10 min-[520px]:w-10 min-[520px]:text-lg"
            aria-label="Carrito"
          >
            🛒
            <CartBadge count={cartCount} />
          </Link>
        </div>
      </div>
    </header>
  );
}
