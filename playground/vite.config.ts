import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      // Aliases point at the src folders rather than index.ts so that
      // subpaths such as `…/style.css` resolve as well.
      {
        find: '@de.maximbigler/vue-big-tooltip',
        replacement: fileURLToPath(new URL('../packages/vue/src', import.meta.url)),
      },
      {
        find: '@de.maximbigler/big-tooltip-core',
        replacement: fileURLToPath(new URL('../packages/core/src', import.meta.url)),
      },
    ],
  },
});
