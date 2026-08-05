import { NextResponse } from "next/server";
import { sendAbandonedCartReminders } from "@/lib/abandoned-cart";

/**
 * Solo la llama el scheduled handler de Cloudflare (custom-worker.ts), pasando
 * CRON_SECRET por header. Sin este candado, cualquiera en internet podría
 * pegarle a esta ruta y disparar un envío de correos fuera de horario.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("x-cron-secret");
  if (!secret || header !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await sendAbandonedCartReminders();
  return NextResponse.json(result);
}
