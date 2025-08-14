import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

const ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_S3_BUCKET_URL',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'VITE_BE_URL',
] as const;

export default defineConfig(({ mode }) => {
  const currentMode = process.env.MODE || mode;
  const isDev = currentMode === 'development';

  console.log(`🔧 Vite mode: ${currentMode}`);

  const env = loadEnv(currentMode, process.cwd(), '');

  const defineEnv = ENV_VARS.reduce(
    (acc, key) => {
      acc[`import.meta.env.${key}`] = JSON.stringify(env[key]);
      return acc;
    },
    {} as Record<string, string>,
  );

  return {
    envDir: './',
    envPrefix: 'VITE_',

    server: {
      port: 5173,
      open: true,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': isDev ? 'unsafe-none' : 'require-corp',
      },
      proxy: {
        '^/cloudfront/.*': {
          target: 'https://d947ql2abwvv8.cloudfront.net',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/cloudfront/, ''),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('CloudFront proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Proxying CloudFront request:', req.method, req.url);
              proxyReq.setHeader('User-Agent', 'Vite-Proxy/1.0');
              proxyReq.setHeader('Accept', 'image/*,*/*');
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              proxyRes.headers['access-control-allow-origin'] = '*';
              proxyRes.headers['access-control-allow-credentials'] = 'false';
              console.log('CloudFront response:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },

    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: !isDev,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            ui: ['@mui/material', '@radix-ui/react-dialog'],
          },
        },
      },
    },

    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@vite/client', '@vite/env'],
    },

    esbuild: {
      drop: isDev ? [] : ['console', 'debugger'],
    },

    define: defineEnv,
  };
});
