import { auth } from "@/auth";
import { ContactForm } from "@/components/ContactForm";
import { Icon, type IconName } from "@/components/Icon";
import { WhatsAppAyuda } from "@/components/WhatsAppButton";
import { pageMetadata, SUPPORT_EMAIL } from "@/lib/site";
import { MENSAJE_GENERAL, whatsappUrl } from "@/lib/whatsapp";

export const metadata = pageMetadata({
  title: "Contacto",
  description:
    "Escríbele a VITATECH: consultas de productos, pedidos, garantías y compras al por mayor. Te respondemos por correo en menos de un día hábil.",
  path: "/contacto",
});

const DATOS: { icon: IconName; titulo: string; valor: string; href?: string }[] = [
  { icon: "mail", titulo: "Correo", valor: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
  { icon: "whatsapp", titulo: "WhatsApp", valor: "+502 5335-3561", href: whatsappUrl(MENSAJE_GENERAL) },
  { icon: "clock", titulo: "Horario", valor: "Lunes a sábado, 9:00 a. m. – 6:00 p. m." },
];

export default async function ContactoPage() {
  // Solo para ahorrarle escribir al que ya inició sesión. El correo que vale
  // es el que quede en el formulario: puede querer que le respondan a otro.
  const session = await auth();
  const defaults = session?.user
    ? { nombre: session.user.name ?? undefined, correo: session.user.email ?? undefined }
    : undefined;

  return (
    <div className="animate-vt-fade mx-auto max-w-[1080px] px-4 py-12 min-[520px]:px-6 min-[720px]:py-16">
      <div className="mb-10 max-w-[620px]">
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-vt-accent/[.12] text-vt-accent">
          <Icon name="mail" className="h-6 w-6" />
        </span>
        <h1 className="font-heading text-[30px] leading-tight font-bold text-white min-[720px]:text-[36px]">
          Escríbenos, <span className="text-vt-accent">te respondemos por correo</span>
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-vt-muted-1">
          ¿Dudas sobre un producto, tu pedido o una compra al por mayor? Déjanos tu mensaje y te contestamos en
          menos de un día hábil.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 min-[900px]:grid-cols-[1fr_320px]">
        <section className="rounded-3xl border border-white/10 bg-white/[.03] p-5 min-[520px]:p-7">
          <ContactForm defaults={defaults} />
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/[.03] p-6">
            <h2 className="font-heading mb-4 text-[16px] font-bold text-white">Otras formas de contactarnos</h2>
            <ul className="flex flex-col gap-4">
              {DATOS.map((d) => (
                <li key={d.titulo} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-vt-accent/[.1] text-vt-accent">
                    <Icon name={d.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] text-vt-muted-2">{d.titulo}</div>
                    {d.href ? (
                      <a
                        href={d.href}
                        {...(d.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="text-[13.5px] font-semibold break-all text-vt-fg hover:text-vt-accent"
                      >
                        {d.valor}
                      </a>
                    ) : (
                      <div className="text-[13.5px] font-semibold text-vt-fg">{d.valor}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-vt-accent/20 bg-gradient-to-br from-vt-accent/[.09] to-transparent p-6">
            <p className="text-[13.5px] text-vt-muted-1">¿Es urgente? Por WhatsApp te atendemos más rápido.</p>
            <WhatsAppAyuda href={whatsappUrl(MENSAJE_GENERAL)} origen="contacto" />
          </div>
        </aside>
      </div>
    </div>
  );
}
