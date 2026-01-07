import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,         // <--- 修改這裡：改成 3002
    strictPort: true,   // <--- 新增這行：強制鎖定，防止亂跳
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
