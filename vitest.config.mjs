import { defineConfig } from 'vitest/config';

export default defineConfig({
  environment: 'node',
  test: {
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
