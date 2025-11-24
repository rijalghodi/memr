import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

import { htmlMetaPlugin } from "./vite-plugin-html-meta";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), htmlMetaPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
  },
});
