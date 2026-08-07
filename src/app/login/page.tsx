import { isGoogleEnabled } from "@/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  // Se lee aquí (en el servidor, dentro del request) y no en el cliente: en
  // Cloudflare Workers las variables de entorno solo existen durante un request.
  return <LoginForm googleEnabled={isGoogleEnabled()} authError={error} />;
}
