import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    hookTimeout: 40_000,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    reporters: ['default', 'verbose'],
    testTimeout: 40_000,
  },
});
