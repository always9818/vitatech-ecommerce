import Link from "next/link";
import { verifyResetToken } from "@/lib/password-reset-actions";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Restablecer contraseña" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await verifyResetToken(token ?? "");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-260px)] max-w-[420px] flex-col justify-center px-6 py-16">
      {result.valid ? (
        <>
          <h1 className="font-heading text-[24px] font-bold text-white">
            Crea una contraseña nueva
          </h1>
          <p className="mt-2 mb-8 text-[14px] text-vt-muted-1">
            Elige una contraseña de al menos 8 caracteres.
          </p>
          <ResetPasswordForm token={token ?? ""} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <Icon name="xCircle" className="h-10 w-10 text-vt-error" />
          <h1 className="font-heading text-[20px] font-bold text-white">{result.reason}</h1>
          <p className="text-[14px] text-vt-muted-1">
            Pide un enlace nuevo — los enlaces solo funcionan una vez y vencen después de una hora.
          </p>
          <Link
            href="/olvide-contrasena"
            className="vt-btn vt-btn-accent mt-2 rounded-[10px] bg-vt-accent px-6 py-3 text-sm font-extrabold text-vt-accent-fg"
          >
            Pedir un enlace nuevo
          </Link>
        </div>
      )}
    </div>
  );
}
