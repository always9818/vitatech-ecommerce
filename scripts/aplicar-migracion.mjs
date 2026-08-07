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
 *   node scripts/aplicar-migracion.mjs docs/migracion-departamentos.sql
 *   node scripts/aplicar-migracion.mjs docs/mi.sql Category   # inspecciona esa tabla
 *
 * Si se le pasa un nombre de tabla como segundo argumento, imprime sus columnas
 * antes y después para poder verificar a simple vista que la migración hizo lo
 * que debía.
 *
 * Todo va dentro de una transacción: si una sentencia falla, no queda la base a
 * medio migrar.
 */
import pg from "pg";
import fs from "node:fs";
import dotenv from "dotenv";

dotenv.config();

const archivo = process.argv[2];
const tabla = process.argv[3];

if (!archivo) {
  console.error("Falta el archivo .sql. Ejemplo: node scripts/aplicar-migracion.mjs docs/mi-migracion.sql");
  process.exit(1);
}

const sql = fs.readFileSync(archivo, "utf8");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function columnas(etiqueta) {
  if (!tabla) return;
  const { rows } = await client.query(
    `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position`,
    [tabla]
  );
  console.log(`${etiqueta} ${tabla}:`);
  for (const r of rows) {
    console.log(
      `   ${r.column_name} · ${r.data_type}${r.is_nullable === "YES" ? " · opcional" : ""}` +
        (r.column_default ? ` · default ${r.column_default}` : "")
    );
  }
}

await client.connect();
await columnas("ANTES  ");

try {
  await client.query("BEGIN");
  await client.query(sql);
  await client.query("COMMIT");
  console.log(`\nAplicado: ${archivo}\n`);
} catch (err) {
  await client.query("ROLLBACK");
  console.error("FALLÓ, se revirtió todo:", err.message);
  await client.end();
  process.exit(1);
}

await columnas("DESPUES");
await client.end();
