"use server";

import { signOut } from "@/auth";

/**
 * Cerrar sesión desde un componente de cliente. Vive en su propio archivo
 * porque un componente de cliente no puede declarar acciones de servidor.
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
