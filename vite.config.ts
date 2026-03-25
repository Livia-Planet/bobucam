import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // 🌟 你可以在這裡定義一個全局變量
      'process.env.APP_TITLE': JSON.stringify('BobuCam'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // 保持原樣，這是 AI Studio 的環境設定
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});