import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "pg-cloudflare"],

  // La tienda se sirve en un solo dominio: importadoravitatech.com, sin www.
  //
  // No es cosmético. El login con Google rompía cuando el visitante entraba por
  // www: Auth.js deja las cookies `__Host-authjs.csrf-token` y
  // `__Secure-authjs.pkce.code_verifier` en el host donde arranca el flujo, pero
  // el callback vuelve siempre a la URL de NEXTAUTH_URL, que es el dominio raíz.
  // El prefijo `__Host-` prohíbe el atributo Domain por especificación, así que
  // esas cookies nunca cruzan de www al dominio raíz: al volver de Google no
  // había nada que verificar y Auth.js abortaba con "There is a problem with the
  // server configuration".
  //
  // Redirigir en el borde garantiza que el flujo empiece y termine en el mismo
  // host. 308 (permanent) para que buscadores y navegadores lo memoricen y de
  // paso se acabe el contenido duplicado en los dos dominios.
  // La raíz va en su propia regla, antes del comodín. Con `/:path*` sola, el
  // build de producción no sustituye el comodín cuando no hay ruta que capturar
  // y responde un Location literal `https://importadoravitatech.com/:path*`,
  // que es un 404. En desarrollo no pasa: solo se ve en el sitio desplegado.
  // Las reglas se evalúan en orden, así que esta atiende "/" y la siguiente
  // el resto.
  async redirects() {
    const desdeWww = [{ type: "host" as const, value: "www.importadoravitatech.com" }];
    return [
      {
        source: "/",
        has: desdeWww,
        destination: "https://importadoravitatech.com/",
        permanent: true,
      },
      {
        source: "/:path*",
        has: desdeWww,
        destination: "https://importadoravitatech.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
