import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  return prisma.siteSettings.findUnique({ where: { id: "main" } });
}
