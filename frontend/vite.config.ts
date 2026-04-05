import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import pkg from './package.json';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    electron([
      {
        // Ponto de entrada do processo Main
        entry: 'electron/main.ts',
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          // Notifica o processo de renderização para recarregar quando o script de preload for atualizado
          options.reload();
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
