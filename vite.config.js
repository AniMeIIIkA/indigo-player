import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: ['src/index.ts', 'src/ui/theme/index.scss'],
      name: '@axl/indigo-player',
      formats: ['es']
    },
    minify: process.env.NODE_ENV == 'production',
    sourcemap: true,
    watch: process.env.NODE_ENV == 'development',
  },
  plugins: [dts()]
})
