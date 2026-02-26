import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@tokens': resolve(__dirname, 'src/styles/tokens'),
      '@components': resolve(__dirname, 'src/components'),
      '@data': resolve(__dirname, 'data'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
});
