import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "src") },
      { find: "@pages", replacement: resolve(__dirname, "src/pages") },
      { find: "@component", replacement: resolve(__dirname, "src/components") },
      { find: "@api", replacement: resolve(__dirname, "src/api") },
      { find: "@data", replacement: resolve(__dirname, "src/data") },
      { find: "@assets", replacement: resolve(__dirname, "src/assets") },
      { find: "@utils", replacement: resolve(__dirname, "src/utils") },
    ],
  },
});
