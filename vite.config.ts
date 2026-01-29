
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envPrefix: 'FIREBASE_',
  build: {
    outDir: 'dist',
  }
});
