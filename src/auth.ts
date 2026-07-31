import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { mergeGuestCartIntoUser } from "@/lib/cart-merge";

/**
 * Google solo se activa si sus credenciales existen. La configuración se arma
 * dentro de una función (no al importar el módulo) porque en Cloudflare Workers
 * las variables de entorno NO existen durante la evaluación del módulo, solo
 * dentro de un request. Así, si las credenciales aún no están configuradas, el
 * botón simplemente no aparece y el login con correo sigue intacto.
 */
export function isGoogleEnabled() {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export const { handlers, signIn, signOut, auth } = NextAuth(() => {
  const providers: NextAuthConfig["providers"] = [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        // Cuenta creada con Google: no tiene contraseña que comparar.
        if (!user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ];

  if (isGoogleEnabled()) {
    // Sin argumentos: Auth.js toma AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET del
    // entorno en tiempo de request, que es lo correcto en Workers.
    providers.push(Google);
  }

  return {
    trustHost: true,
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    providers,
    callbacks: {
      async signIn({ user, account, profile }) {
        if (account?.provider === "google") {
          const email = profile?.email;
          // Exigimos que Google haya verificado el correo. Sin esto, una cuenta
          // de Google con correo sin verificar podría apropiarse de una cuenta
          // existente creada con contraseña.
          if (!email || profile?.email_verified !== true) return false;

          const dbUser = await prisma.user.upsert({
            where: { email },
            update: {
              name: user.name ?? undefined,
              image: user.image ?? undefined,
            },
            create: {
              email,
              name: user.name ?? null,
              image: user.image ?? null,
            },
          });

          // El resto del sitio (carrito, órdenes, rol de admin) usa el id de
          // NUESTRA base de datos, no el que trae Google.
          user.id = dbUser.id;
          user.role = dbUser.role;
        }

        if (user?.id) {
          await mergeGuestCartIntoUser(user.id);
        }
        return true;
      },
      jwt({ token, user }) {
        if (user?.id) token.id = user.id;
        if (user && "role" in user) token.role = user.role as "CUSTOMER" | "ADMIN";
        return token;
      },
      session({ session, token }) {
        if (session.user && typeof token.id === "string") session.user.id = token.id;
        if (session.user && typeof token.role === "string") {
          session.user.role = token.role as "CUSTOMER" | "ADMIN";
        }
        return session;
      },
    },
  };
});
