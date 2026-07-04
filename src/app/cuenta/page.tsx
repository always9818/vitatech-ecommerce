import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-[560px] px-6 py-16">
      <div className="font-heading text-[28px] font-bold text-white">Mi cuenta</div>
      <div className="mt-4 rounded-2xl border border-white/10 p-6">
        <div className="text-[13px] text-vt-muted-2">Nombre</div>
        <div className="text-[15px] font-semibold text-vt-fg">{session.user.name ?? "—"}</div>
        <div className="mt-4 text-[13px] text-vt-muted-2">Correo</div>
        <div className="text-[15px] font-semibold text-vt-fg">{session.user.email}</div>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-6"
      >
        <button
          type="submit"
          className="rounded-[10px] border border-white/[.14] px-6 py-3 text-[13.5px] font-semibold text-vt-fg hover:border-vt-accent hover:text-vt-accent"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
