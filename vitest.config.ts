import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // Point the package names at their sources so tests run without a prior build.
    alias: [
      {
        find: '@maximbigler/vue-big-tooltip',
        replacement: fileURLToPath(new URL('./packages/vue/src', import.meta.url)),
      },
      {
        find: '@maximbigler/big-tooltip-core',
        replacement: fileURLToPath(new URL('./packages/core/src', import.meta.url)),
      },
      {
        find: /^@floating-ui\/dom$/,
        replacement: fileURLToPath(new URL('./test/floating-ui-stub.ts', import.meta.url)),
      },
    ],
  },
  test: {
    environment: 'happy-dom',
    include: ['packages/*/src/**/*.test.ts'],
    setupFiles: ['./test/setup.ts'],
  },
});
