import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = { title: "Recuperar contraseña" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-260px)] max-w-[420px] flex-col justify-center px-6 py-16">
      <h1 className="font-heading text-[24px] font-bold text-white">¿Olvidaste tu contraseña?</h1>
      <p className="mt-2 mb-8 text-[14px] text-vt-muted-1">
        Escribe el correo con el que te registraste y te enviamos un enlace para crear una
        contraseña nueva.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
