import path from 'path';
import { defineConfig } from 'vite';

// vite plugins
import react from '@vitejs/plugin-react-swc';
import Fonts from 'unplugin-fonts/vite';
import { compression } from 'vite-plugin-compression2';
import Inspect from 'vite-plugin-inspect';
import svgr from 'vite-plugin-svgr';

import { fonts } from './configs/fonts.config';

export default defineConfig({
  plugins: [
    svgr(),
    react(),
    Inspect(),
    compression(),
    Fonts({ google: { families: fonts } }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
