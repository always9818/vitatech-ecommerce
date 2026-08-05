import { prisma } from "@/lib/prisma";
import { sendAbandonedCartEmail } from "@/lib/email";

/**
 * Ventana de abandono: entre 3 horas (para no molestar a alguien que sigue
 * comprando en este momento) y 7 días (un carrito de hace un mes ya no es
 * "abandono", es alguien que quizás volvió por otra razón).
 */
const MIN_HOURS_SINCE_UPDATE = 3;
const MAX_DAYS_SINCE_UPDATE = 7;

/**
 * Busca carritos de usuarios con sesión (los de invitado no tienen correo a
 * quién escribirle) que llevan quietos dentro de la ventana de abandono y
 * todavía no recibieron un recordatorio desde el último cambio. Manda un
 * correo por carrito y marca `abandonedEmailSentAt` para no repetirlo.
 *
 * Se llama desde la ruta /api/cron/abandoned-carts, disparada por el
 * scheduled handler de Cloudflare (ver custom-worker.ts) — nunca
 * directamente desde una página, porque recorre TODOS los carritos
 * pendientes de la tienda.
 */
export async function sendAbandonedCartReminders() {
  const now = new Date();
  const minUpdatedAt = new Date(now.getTime() - MAX_DAYS_SINCE_UPDATE * 24 * 60 * 60 * 1000);
  const maxUpdatedAt = new Date(now.getTime() - MIN_HOURS_SINCE_UPDATE * 60 * 60 * 1000);

  const carts = await prisma.cart.findMany({
    where: {
      userId: { not: null },
      updatedAt: { gte: minUpdatedAt, lte: maxUpdatedAt },
      items: { some: {} },
    },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: { select: { id: true, name: true, price: true, stock: true } } } },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const cart of carts) {
    // El recordatorio ya cubre esta versión del carrito: `updatedAt` no
    // avanzó desde entonces, así que no hay nada nuevo que avisar.
    if (cart.abandonedEmailSentAt && cart.abandonedEmailSentAt >= cart.updatedAt) {
      skipped++;
      continue;
    }
    if (!cart.user?.email || cart.items.length === 0) {
      skipped++;
      continue;
    }

    const items = cart.items.map((it) => ({
      name: it.product.name,
      quantity: it.quantity,
      price: it.product.price,
    }));
    const total = items.reduce((a, it) => a + it.price * it.quantity, 0);

    await sendAbandonedCartEmail(cart.user.email, {
      name: cart.user.name,
      items,
      total,
    });

    // $executeRaw a propósito, NO prisma.cart.update(): ese `update()` habría
    // tocado también `updatedAt` (Prisma lo bumpea en CUALQUIER escritura al
    // registro, aunque el campo no venga en `data`), y el chequeo de arriba
    // compara justo esos dos campos entre sí — habría vuelto a calificar como
    // "carrito tocado de nuevo" en la próxima corrida y reenviado el correo
    // cada hora, para siempre. Confirmado con datos reales antes de publicar.
    await prisma.$executeRaw`UPDATE "Cart" SET "abandonedEmailSentAt" = ${now} WHERE id = ${cart.id}`;
    sent++;
  }

  return { candidatos: carts.length, enviados: sent, omitidos: skipped };
}
