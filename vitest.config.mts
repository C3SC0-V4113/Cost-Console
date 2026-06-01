import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const rootDirectory = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: [{ find: '@', replacement: rootDirectory }],
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
