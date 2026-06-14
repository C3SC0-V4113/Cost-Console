import 'server-only';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { PrismaClient } from '@/lib/generated/prisma/client';

// Reuse a single PrismaClient across hot reloads in development to avoid
// exhausting database connections. Prisma 7 builds the client on a `pg` driver
// adapter; we own the pool so its sizing can be tuned for serverless later.
// The pooled connection string comes from DATABASE_URL.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
