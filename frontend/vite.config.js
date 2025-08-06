import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "./src/pages") },
      { find: "@pages", replacement: resolve(__dirname, "src/pages") },
      { find: "@component", replacement: resolve(__dirname, "src/components") },
      { find: "@api", replacement: resolve(__dirname, "src/api") },
      { find: "@data", replacement: resolve(__dirname, "src/data") },
      { find: "@assets", replacement: resolve(__dirname, "src/assets") },
      { find: "@utils", replacement: resolve(__dirname, "src/utils") },
      { find: "@store", replacement: resolve(__dirname, "src/store") },
      { find: "@hooks", replacement: resolve(__dirname, "src/hooks") },
    ],
  },
});
