import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "pg-cloudflare"],

  // Anunciaba "x-powered-by: Next.js" en cada respuesta: información gratis
  // para quien busque vulnerabilidades conocidas de una versión concreta.
  poweredByHeader: false,

  // Antes de esto la tienda no mandaba NINGUNA cabecera de seguridad
  // (verificado en vivo el 2026-08-27 sobre la portada).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Un año de HTTPS obligatorio. A propósito SIN `includeSubDomains`:
          // eso ataría también a notificaciones.importadoravitatech.com (el
          // subdominio de Resend) y a cualquier subdominio futuro, durante un
          // año y sin vuelta atrás práctica, porque el navegador se lo queda
          // cacheado. El dominio raíz sí lleva meses 100% HTTPS detrás de
          // Cloudflare, así que ahí no hay riesgo. Sumar includeSubDomains y
          // preload es una decisión aparte, para tomarla a conciencia.
          { key: "Strict-Transport-Security", value: "max-age=31536000" },

          // El navegador respeta el Content-Type que mandamos en vez de
          // adivinarlo: un archivo subido al panel no puede hacerse pasar por
          // script.
          { key: "X-Content-Type-Options", value: "nosniff" },

          // A sitios externos solo les llega el origen, nunca la ruta
          // completa: los ids de pedido de /checkout/success?order=... no se
          // filtran en el Referer.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // Clickjacking. Lo que de verdad protege es /admin: sin esto, otra
          // página puede meter el panel en un iframe invisible y hacer que
          // Angel haga clic en algo que no ve.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },

          // La tienda no usa ninguna de las tres. `payment` NO se bloquea a
          // propósito: el cobro ocurre en app.recurrente.com, pero cerrarlo
          // aquí no aporta nada y sí podría estorbar si algún día se integra
          // un pago en la propia página.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

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
