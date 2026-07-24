import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint temporal de diagnóstico de conectividad a la base de datos.
 * Reporta si la consulta funciona y, si falla, el error real (que en
 * producción Next.js oculta tras un "digest").
 * NUNCA devuelve el valor de DATABASE_URL, solo si está presente.
 *
 * TODO: eliminar una vez confirmado que el despliegue conecta bien.
 */
export async function GET() {
  const url = process.env.DATABASE_URL;
  const diagnostics = {
    databaseUrlPresent: Boolean(url),
    databaseUrlLength: url?.length ?? 0,
    databaseUrlHost: url ? (url.split("@")[1]?.split("/")[0] ?? "?") : null,
  };

  try {
    const count = await prisma.product.count();
    return NextResponse.json({ ok: true, productCount: count, ...diagnostics });
  } catch (err) {
    const error = err as Error & { code?: string; cause?: unknown };
    return NextResponse.json(
      {
        ok: false,
        ...diagnostics,
        errorName: error?.name ?? null,
        errorMessage: error?.message ?? null,
        errorCode: error?.code ?? null,
        errorCause: error?.cause ? String(error.cause) : null,
        errorStack: error?.stack?.split("\n").slice(0, 6).join("\n") ?? null,
      },
      { status: 500 }
    );
  }
}
