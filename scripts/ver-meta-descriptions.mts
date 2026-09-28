// Solo lectura: muestra la meta description que tendría cada producto visible.
// Uso: npx tsx scripts/ver-meta-descriptions.mts
import "dotenv/config";
import pg from "pg";
import { productMetaDescription } from "../src/lib/product-meta";
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const { rows } = await c.query(`select name, price, "oldPrice", stock, description from "Product" where visible = true order by name`);
for (const r of rows) {
  const d = productMetaDescription(r);
  console.log(`[${String(d.length).padStart(3)}] ${d}`);
}
await c.end();
