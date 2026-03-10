import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./app/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['app/**/*.{ts,tsx}'],
      exclude: [
        'app/routes/**',
        'app/test/**',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        'app/root.tsx',
        'app/components/ui/**',
      ],
    },
  },
});
