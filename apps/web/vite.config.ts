import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    proxy: {
      '/auth': 'http://localhost:8080',
      '/categories': 'http://localhost:8080',
      '/daily-records': 'http://localhost:8080',
      '/holidays': 'http://localhost:8080',
    },
  },
  plugins: [tailwindcss(), react()],
});
