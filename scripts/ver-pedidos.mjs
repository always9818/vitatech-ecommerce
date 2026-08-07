/**
 * Lista los últimos pedidos con quién los hizo. Solo lectura.
 *
 * Sirve para revisar de un vistazo si un pedido es de un cliente con cuenta o
 * de un invitado, sin tener que entrar al panel. Existe por lo mismo que
 * `aplicar-migracion.mjs`: la CLI de Prisma no conecta desde la red de Angel,
 * pero el driver `pg` sí.
 *
 * Uso:  node scripts/ver-pedidos.mjs [cuántos]
 */
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const limite = Number(process.argv[2] ?? 5);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

await client.connect();

const { rows } = await client.query(
  `SELECT o.id,
          o.status,
          o.total,
          o."userId",
          o."guestEmail",
          o."guestId",
          o."shipRecipientName",
          u.email AS "correoDeCuenta",
          o."createdAt"
     FROM "Order" o
     LEFT JOIN "User" u ON u.id = o."userId"
    ORDER BY o."createdAt" DESC
    LIMIT $1`,
  [limite]
);

for (const r of rows) {
  const quien = r.userId ? `cuenta ${r.correoDeCuenta}` : `INVITADO ${r.guestEmail ?? "(sin correo)"}`;
  console.log(
    `#${r.id.slice(-8)}  ${r.status.padEnd(8)}  Q${r.total}  ${quien}  ` +
      `[cookie invitado: ${r.guestId ? "sí" : "no"}]  ${r.shipRecipientName ?? ""}`
  );
}

await client.end();
