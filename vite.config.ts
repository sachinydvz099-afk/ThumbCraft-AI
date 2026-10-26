import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base allows deployment to any GitHub Pages subpath (https://USER.github.io/REPO/)
  // or root domain without hardcoding. Can also be overridden with VITE_BASE_PATH.
  base: process.env.VITE_BASE_PATH || './',
  server: {
    port: 3000,
    open: true,
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
