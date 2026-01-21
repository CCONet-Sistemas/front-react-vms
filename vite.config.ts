import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app'),
      '~/components': path.resolve(__dirname, 'app/components'),
      '~/styles': path.resolve(__dirname, 'app/styles'),
      '~/utils': path.resolve(__dirname, 'app/utils'),
      '~/services': path.resolve(__dirname, 'app/services'),
      '~/hooks': path.resolve(__dirname, 'app/hooks'),
      '~/store': path.resolve(__dirname, 'app/store'),
      '~/types': path.resolve(__dirname, 'types'),
      '~/lib': path.resolve(__dirname, 'lib'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
