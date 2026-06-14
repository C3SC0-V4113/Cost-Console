import { defineConfig } from '@prisma/config';
import { config as loadEnv } from 'dotenv';

// Prisma 7 no longer auto-loads .env. Load local env files for the CLI
// (.env.local first, then .env). The app runtime keeps using Next.js env loading.
loadEnv({ path: ['.env.local', '.env'] });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  // Migrate/introspection use the direct (non-pooled) connection.
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});
