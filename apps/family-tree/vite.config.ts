import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080';
  const proxyRewrite = env.VITE_PROXY_REWRITE !== 'false';

  return {
    server: {
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          ...(proxyRewrite ? { rewrite: (path: string) => path.replace(/^\/api/, '') } : {}),
        },
      },
    },
    plugins: [tailwindcss(), react()],
  };
});
