import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import istanbul from 'vite-plugin-istanbul';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env file tương ứng với mode (ví dụ: .env.test)
  const env = loadEnv(process.env.MODE || mode, process.cwd(), '');

  return {
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
    plugins: [
      react(),
      tailwindcss(),
      istanbul({
        cypress: true,
        requireEnv: false,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Ép biến env dùng được trong import.meta.env
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
    },
  };
});
