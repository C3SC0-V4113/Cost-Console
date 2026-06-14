import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const rootDirectory = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: rootDirectory },
      // `server-only` only resolves under the React Server condition; stub it in tests.
      {
        find: /^server-only$/,
        replacement: fileURLToPath(new URL('./tests/test-stubs/server-only.ts', import.meta.url)),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    env: {
      // lib/prisma requires DATABASE_URL at import time; the client is mocked in
      // unit tests, so this dummy value never opens a real connection.
      // eslint-disable-next-line @typescript-eslint/naming-convention -- environment variable name
      DATABASE_URL: 'postgresql://cost_console:cost_console@localhost:5433/cost_console',
    },
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
