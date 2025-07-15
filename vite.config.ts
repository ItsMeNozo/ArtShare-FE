import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite automatically loads .env.test when MODE=test
  const currentMode = process.env.MODE || mode;
  console.log(`🔧 Vite mode: ${currentMode}`);

  // Load environment variables based on mode
  const env = loadEnv(currentMode, process.cwd(), '');

  return {
    // Override env file path for test mode
    envDir: './',
    envPrefix: 'VITE_',
    server: {
      port: 5173, // fixed port for the admin app
      open: true, // (optional) auto‑open browser
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        // Use unsafe-none for development to allow Firebase popups
        // In production, consider using "require-corp" for better security
        'Cross-Origin-Embedder-Policy':
          mode === 'development' ? 'unsafe-none' : 'require-corp',
      },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Need to explicitly define these for custom modes like 'test'
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(
        env.VITE_FIREBASE_API_KEY,
      ),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(
        env.VITE_FIREBASE_AUTH_DOMAIN,
      ),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(
        env.VITE_FIREBASE_PROJECT_ID,
      ),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(
        env.VITE_FIREBASE_STORAGE_BUCKET,
      ),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(
        env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      ),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(
        env.VITE_FIREBASE_APP_ID,
      ),
      'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(
        env.VITE_FIREBASE_MEASUREMENT_ID,
      ),
      'import.meta.env.VITE_S3_BUCKET_URL': JSON.stringify(
        env.VITE_S3_BUCKET_URL,
      ),
      'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(
        env.VITE_STRIPE_PUBLISHABLE_KEY,
      ),
      'import.meta.env.VITE_BE_URL': JSON.stringify(env.VITE_BE_URL),
    },
  };
});
