import { isGoogleEnabled } from "@/auth";
import { LoginForm } from "./LoginForm";

/**
 * A dónde mandar al cliente después de entrar.
 *
 * Solo se aceptan rutas internas que empiecen con una sola barra. Sin este
 * filtro, un `?next=https://sitio-falso.com` convertiría nuestro login en un
 * trampolín para llevarse clientes a otro lado — y `//sitio-falso.com` cuenta
 * como URL externa para el navegador, por eso también se descarta.
 */
function destinoSeguro(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  // Se lee aquí (en el servidor, dentro del request) y no en el cliente: en
  // Cloudflare Workers las variables de entorno solo existen durante un request.
  return (
    <LoginForm googleEnabled={isGoogleEnabled()} authError={error} next={destinoSeguro(next)} />
  );
}
