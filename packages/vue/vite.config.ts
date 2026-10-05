import vue from '@vitejs/plugin-vue';
import dts from 'unplugin-dts/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue(), dts({ tsconfigPath: './tsconfig.build.json' })],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style', // Served as the package's `./style.css` export.
    },
    rollupOptions: {
      external: ['vue', '@maximbigler/big-tooltip-core', '@floating-ui/dom'],
    },
    sourcemap: true,
    minify: false,
  },
});
