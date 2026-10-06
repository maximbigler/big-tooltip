import { defineConfig } from 'vite';
import dts from 'unplugin-dts/vite';

export default defineConfig({
  plugins: [dts({ tsconfigPath: './tsconfig.build.json' })],
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index' },
    rollupOptions: { external: ['@floating-ui/dom'] },
    sourcemap: true,
  },
});
