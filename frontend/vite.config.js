import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
      host: '0.0.0.0',  // 외부 IP 접근 허용
      port: 5173,       // 포트 변경 가능
      strictPort: true, // 포트 고정 (충돌시 실패, auto-increment 안 함)
      proxy: {
        '/api': {
            target: 'http://localhost:8080', // 백엔드 주소
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@component": path.resolve(__dirname, "src/components"),
      "@api": path.resolve(__dirname, "src/api"),
      "@data": path.resolve(__dirname, "src/data"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@store": path.resolve(__dirname, "src/store"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@router": path.resolve(__dirname, "src/router"),
      "@layout": path.resolve(__dirname, "src/layout"),
      "@auth": path.resolve(__dirname, "src/auth"),
    },
  },
});
