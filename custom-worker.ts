// @ts-expect-error `.open-next/worker.js` se genera en build (opennextjs-cloudflare build)
import { default as handler } from "./.open-next/worker.js";

/**
 * Envoltorio sobre el worker que genera OpenNext, solo para sumarle el
 * handler `scheduled` que Cloudflare llama según los `triggers.crons` de
 * wrangler.jsonc — OpenNext no genera uno por su cuenta. El `fetch` normal
 * del sitio se delega tal cual al handler generado, sin tocarlo.
 *
 * Los tipos completos del runtime de Workers (ExecutionContext,
 * ScheduledEvent, CloudflareEnv) solo existen en cloudflare-env.d.ts,
 * generado localmente por `wrangler types` y en .gitignore — no existen
 * durante el build de CI (mismo motivo que en src/lib/r2.ts). Se declaran
 * aquí, a mano, solo los campos mínimos que este archivo usa de verdad.
 */
type MinimalExecutionContext = {
  waitUntil: (promise: Promise<unknown>) => void;
};

type MinimalEnv = {
  CRON_SECRET?: string;
};

// Cloudflare pasa en `event.cron` la MISMA cadena que aparece en
// wrangler.jsonc, así que sirve para saber cuál de los dos disparadores
// entró. A las en punto coinciden los dos y Cloudflare invoca este handler
// dos veces, una por expresión: cada una hace lo suyo y ninguna pisa a la
// otra.
type MinimalScheduledEvent = {
  cron?: string;
  scheduledTime?: number;
};

/** Debe coincidir carácter por carácter con wrangler.jsonc → triggers.crons. */
const CRON_CARRITOS_ABANDONADOS = "0 * * * *";

const worker = {
  fetch: handler.fetch,

  async scheduled(event: MinimalScheduledEvent, env: MinimalEnv, ctx: MinimalExecutionContext) {
    // Cada hora en punto: el barrido de carritos abandonados, que recorre
    // todos los carritos pendientes de la tienda. Los demás disparos (cada 5
    // minutos) solo hacen `SELECT 1` para que la base no se duerma y ningún
    // visitante vuelva a toparse con los 21 segundos del primer arranque.
    // Se decide por `cron` cuando viene, y si no por el minuto de
    // `scheduledTime`. La redundancia es a propósito: si un cambio del
    // runtime dejara `cron` vacío, con un solo criterio el barrido de
    // carritos abandonados dejaría de correr para siempre y en silencio —
    // nadie se entera de un correo que NO se manda.
    const tocaCarritos =
      event?.cron === CRON_CARRITOS_ABANDONADOS ||
      (event?.cron === undefined &&
        typeof event?.scheduledTime === "number" &&
        new Date(event.scheduledTime).getUTCMinutes() === 0);

    const ruta = tocaCarritos ? "/api/cron/abandoned-carts" : "/api/cron/keep-alive";

    ctx.waitUntil(
      handler.fetch(
        new Request(`https://internal.vitatech${ruta}`, {
          method: "POST",
          headers: { "x-cron-secret": env.CRON_SECRET ?? "" },
        }),
        env,
        ctx
      )
    );
  },
};

export default worker;
