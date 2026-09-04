import Link from "next/link";
import { estadoDelToken } from "@/lib/email-verification-actions";
import { VerifyForm } from "./VerifyForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Confirmar correo · VITATECH_" };

export default async function VerificarCorreoPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const estado = await estadoDelToken(token ?? "");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-260px)] max-w-[420px] flex-col justify-center px-6 py-16">
      {estado.valido ? (
        <>
          <h1 className="font-heading text-[24px] font-bold text-white">Confirma tu correo</h1>
          <p className="mt-2 mb-8 text-[14px] text-vt-muted-1">
            Un clic y listo. Así sabemos que te llegan los avisos de tus pedidos.
          </p>
          <VerifyForm token={token ?? ""} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <Icon name="xCircle" className="h-10 w-10 text-vt-error" />
          <h1 className="font-heading text-[20px] font-bold text-white">{estado.motivo}</h1>
          <p className="text-[14px] text-vt-muted-1">
            Los enlaces solo funcionan una vez y vencen a las 24 horas. Puedes pedir uno nuevo desde
            Mi cuenta.
          </p>
          <Link
            href="/cuenta"
            className="vt-btn vt-btn-accent mt-2 rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-extrabold text-vt-accent-fg"
          >
            Ir a Mi cuenta
          </Link>
        </div>
      )}
    </div>
  );
}
