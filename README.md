# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Testing

This project uses Playwright for end-to-end testing. Here are the available test commands:

### Test Commands

```bash
# Run all E2E tests (Chrome)
npm test

# Run tests with interactive UI
npm run test:ui

# Run smoke tests only (quick essential tests)
npm run test:smoke

# Run safe tests only (read-only, production-safe)
npm run test:safe

# Run unsafe tests (data-modifying, preview environment only)
npm run test:unsafe

# View test reports
npm run test:report
```

### Test Types

- **E2E Tests** (`npm test`): Full end-to-end tests using Chrome browser
- **Smoke Tests** (`npm run test:smoke`): Quick tests to verify core functionality
- **Safe Tests** (`npm run test:safe`): Read-only tests safe to run against production
- **Unsafe Tests** (`npm run test:unsafe`): Data-modifying tests that create/update/delete data (runs against preview environment)
- **UI Tests** (`npm run test:ui`): Interactive test runner with visual debugging

### Test Environments

Tests automatically target different environments:

- **Local**: `http://localhost:5173` (when running `npm run dev`)
- **Preview**: `https://preview.artsharebe.id.vn` (for unsafe tests)
- **Production**: `https://artsharezone-black.vercel.app` (for safe tests only)

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
