import { cache } from "react";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// En Cloudflare Workers las variables de entorno NO existen mientras se evalúa
// el módulo: solo están disponibles dentro del contexto de un request. Por eso
// el cliente se construye de forma perezosa y nunca al importar este archivo.
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL no está definida en el entorno.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
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
