import 'server-only';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { PrismaClient } from '@/lib/generated/prisma/client';

// Reuse a single PrismaClient across hot reloads in development to avoid
// exhausting database connections. Prisma 7 builds the client on a `pg` driver
// adapter; we own the pool so its sizing can be tuned for serverless later.
// The pooled connection string comes from DATABASE_URL.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Local Docker Compose database. Used as the development default so the app runs
// without any .env DATABASE_URL — and never accidentally targets the
// Identity-Service Postgres on port 5432.
const LOCAL_DEV_DATABASE_URL = 'postgresql://cost_console:cost_console@localhost:5433/cost_console';

function resolveConnectionString(): string {
  const configured = process.env.DATABASE_URL;
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is not set. Configure it for the production database.');
  }

  return LOCAL_DEV_DATABASE_URL;
}

function createPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString: resolveConnectionString() });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
