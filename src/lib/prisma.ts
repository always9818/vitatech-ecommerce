import { cache } from "react";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Postgres suspende la instancia cuando pasa un rato sin consultas. La
 * primera conexión después de eso tiene que despertarla, y mientras tanto su
 * pooler responde "Failed to connect to upstream database". Como el visitante
 * que entra a una tienda dormida es justo el primero del día, ese fallo lo veía
 * él: Next devolvía 500 y Cloudflare pintaba "This page couldn't load".
 *
 * Se reintenta solo este tipo de error, que ocurre ANTES de que la consulta
 * llegue a ejecutarse. Nunca se reintenta una conexión que se cayó a media
 * operación: repetir un `create` a ciegas podría duplicar un pedido.
 */
const ERROR_DE_CONEXION =
  /failed to connect to upstream database|timeout exceeded when trying to connect|can't reach database server/i;

/**
 * Y se reintentan solo LECTURAS. Repetir una lectura no cambia nada, mientras
 * que reintentar una escritura suelta dentro de un `$transaction` (hay cuatro
 * en el proyecto: pedidos, restablecer contraseña, orden del carrusel) la
 * sacaría de la transacción que ya falló y rompería su atomicidad. Además es
 * justo lo que hace falta: el visitante que se topaba con la pantalla de error
 * estaba cargando páginas, no comprando.
 */
const LECTURAS = new Set([
  "findMany",
  "findFirst",
  "findUnique",
  "findFirstOrThrow",
  "findUniqueOrThrow",
  "count",
  "aggregate",
  "groupBy",
]);

const INTENTOS = 3;
const ESPERA_MS = [400, 1200];

function esErrorDeConexion(e: unknown): boolean {
  const mensaje = e instanceof Error ? e.message : String(e);
  return ERROR_DE_CONEXION.test(mensaje);
}

async function conReintento<T>(operacion: () => Promise<T>): Promise<T> {
  let ultimo: unknown;
  for (let intento = 0; intento < INTENTOS; intento++) {
    try {
      return await operacion();
    } catch (e) {
      if (!esErrorDeConexion(e)) throw e;
      ultimo = e;
      const espera = ESPERA_MS[intento];
      if (espera !== undefined) await new Promise((r) => setTimeout(r, espera));
    }
  }
  throw ultimo;
}

// En Cloudflare Workers las variables de entorno NO existen mientras se evalúa
// el módulo: solo están disponibles dentro del contexto de un request. Por eso
// el cliente se construye de forma perezosa y nunca al importar este archivo.
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL no está definida en el entorno.");
  }
  const adapter = new PrismaPg({
    connectionString,
    // Un request de Workers usa un cliente propio y desechable, así que no gana
    // nada abriendo varias conexiones: con `max: 1` las consultas que la página
    // lanza en paralelo (la portada lanza 4) comparten un solo apretón de manos
    // en vez de pagar cuatro, que es lo que disparaba el fallo en frío.
    max: 1,
    // Cortar el intento a los 8s deja margen para reintentar dentro del mismo
    // request; sin esto el pooler tarda ~20s en rendirse y ya no hay tiempo.
    connectionTimeoutMillis: 8_000,
  });
  const client = new PrismaClient({ adapter });

  return client.$extends({
    query: {
      $allModels: {
        $allOperations: ({ operation, query, args }) =>
          LECTURAS.has(operation) ? conReintento(() => query(args)) : query(args),
      },
    },
  }) as unknown as PrismaClient;
}

function isCloudflareWorkers() {
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}

// Memoizado por request (React cache): en Workers un cliente NO puede
// sobrevivir al request que abrió su socket TCP — al reusarlo en el siguiente,
// la promesa de I/O nunca resuelve y el runtime aborta con
// "your Worker's code had hung and would never generate a response".
const getRequestScopedClient = cache(createPrismaClient);

export function getPrisma(): PrismaClient {
  if (isCloudflareWorkers()) {
    return getRequestScopedClient();
  }

  // En Node (dev local) sí conviene un singleton: evita abrir un pool nuevo
  // en cada recarga de HMR.
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Proxy para conservar la API `prisma.model.findMany(...)` en todo el proyecto,
// resolviendo el cliente correcto recién en el momento de usarlo.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = Reflect.get(client, prop) as unknown;
    return typeof value === "function" ? value.bind(client) : value;
  },
});
