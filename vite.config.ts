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

  // DRY: Generate define object programmatically
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
    },

    plugins: [
      react(), // Fast Refresh enabled by default
      tailwindcss(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // Performance optimizations
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

    // Performance: Enable gzip compression
    esbuild: {
      drop: isDev ? [] : ['console', 'debugger'],
    },

    define: defineEnv,
  };
});
