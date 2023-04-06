// vite.config.js
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// eslint-disable-next-line import/no-default-export,import/no-unused-modules
export default defineConfig({
  plugins: [tsconfigPaths()],
  define: { 'process.env.TEST': 'false' },
  build: {
    minify: false,
    outDir: 'dist/node-cjs',
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['lodash.isplainobject', 'lodash.isequal', /node:util/],
    },
  },
})
