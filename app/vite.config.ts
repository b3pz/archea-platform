import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Pubblicata su GitHub Pages in /archea-platform/v2/ (il sito attuale resta nella radice finché non la sostituisce)
export default defineConfig({
  base: '/archea-platform/v2/',
  plugins: [react()],
  build: { outDir: '../v2', emptyOutDir: true, sourcemap: false },
  test: { environment: 'node' },
});
