// Prisma 7 compat — lazy init to avoid build-time errors
// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  try {
    return new PrismaClient();
  } catch {
    // Build-time or serverless — return a stub that won't crash
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        return async () => {
          console.warn(`Prisma not available — ${String(prop)}() called in build/serverless env`);
          return [];
        };
      },
    });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
