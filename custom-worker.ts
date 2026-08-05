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

const worker = {
  fetch: handler.fetch,

  async scheduled(_event: unknown, env: MinimalEnv, ctx: MinimalExecutionContext) {
    ctx.waitUntil(
      handler.fetch(
        new Request("https://internal.vitatech/api/cron/abandoned-carts", {
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
