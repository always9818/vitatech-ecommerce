import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// En Cloudflare Workers las variables de entorno NO existen mientras se evalúa
// el módulo: solo están disponibles dentro del contexto de un request. Por eso
// el cliente se construye de forma perezosa (en el primer uso real) en vez de
// al importar este archivo, que es como fallaba en producción.
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL no está definida en el entorno.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Proxy para conservar la API `prisma.model.findMany(...)` en todo el proyecto,
// resolviendo el cliente real recién en el momento de usarlo.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = Reflect.get(client, prop) as unknown;
    return typeof value === "function" ? value.bind(client) : value;
  },
});
