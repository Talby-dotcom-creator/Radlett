import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Add explicit base configuration
  base: '/',
  // Add build configuration for better debugging
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  // Add server configuration
  server: {
    port: 5173,
    host: true,
  },
  // Add preview configuration
  preview: {
    port: 4173,
    host: true,
  },
});