import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Mantiene despierta la instancia de Prisma Postgres.
 *
 * La base se suspende sola por inactividad y el primer visitante después de
 * ese sueño paga el despertar: 21 segundos y error 1101 medidos en
 * producción, luego 3.8s, y recién de ahí 0.75s. Los reintentos de
 * `src/lib/prisma.ts` tapan el síntoma; esto ataca la causa, que es que
 * nadie toque la base durante minutos.
 *
 * La llama el scheduled handler de Cloudflare (custom-worker.ts) cada 5
 * minutos, con el mismo candado `CRON_SECRET` que la ruta de carritos
 * abandonados: sin él, cualquiera podría martillear la base desde internet.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("x-cron-secret");
  if (!secret || header !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ despierta: true });
  } catch (err) {
    // No es motivo de alarma por sí solo: si la base estaba dormida, este
    // mismo intento es el que la despierta y el siguiente ya pasa. Queda en
    // wrangler tail para poder ver si empieza a fallar seguido.
    console.error("[keep-alive] la base no respondió: %o", err);
    return NextResponse.json({ despierta: false }, { status: 503 });
  }
}
