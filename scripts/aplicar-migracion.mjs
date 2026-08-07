/**
 * Aplica un archivo .sql a la base de la tienda.
 *
 * Existe porque **la CLI de Prisma no conecta desde la red de Angel**
 * (`P1001: Can't reach database server at pooled.db.prisma.io:5432`): su motor
 * Rust usa un canal que el proxy bloquea, mientras que el driver `pg` conecta
 * sin problema. Así que los cambios de esquema se aplican con este script y
 * después se corre `npx prisma generate`.
 *
 * Uso:
 *   node scripts/aplicar-migracion.mjs docs/migracion-checkout-invitado.sql
 *
 * Imprime las columnas afectadas antes y después para poder verificar que hizo
 * lo que debía, y no toca ninguna fila: los .sql de este proyecto son solo DDL.
 */
import pg from "pg";
import fs from "node:fs";
import dotenv from "dotenv";

dotenv.config();

const archivo = process.argv[2];
if (!archivo) {
  console.error("Falta el archivo .sql. Ejemplo: node scripts/aplicar-migracion.mjs docs/mi-migracion.sql");
  process.exit(1);
}

const sql = fs.readFileSync(archivo, "utf8");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

/** Columnas que toca esta migración, para poder mirarlas antes y después. */
async function estado(etiqueta) {
  const { rows } = await client.query(
    `SELECT column_name, is_nullable
       FROM information_schema.columns
      WHERE table_name = 'Order'
        AND column_name IN ('userId', 'guestEmail', 'guestId')
      ORDER BY column_name`
  );
  console.log(etiqueta, JSON.stringify(rows));
}

await client.connect();
await estado("ANTES:  ");
await client.query(sql);
await estado("DESPUES:");

const { rows } = await client.query('SELECT count(*)::int AS n FROM "Order"');
console.log("Pedidos existentes:", rows[0].n);

await client.end();
