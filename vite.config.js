import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import { defineConfig } from "vite";
import toplevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
// https://vitejs.dev/config/

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [react(), wasm(), toplevelAwait()],
  resolve: {
    alias: {
      "@digitalcredentials/open-badges-context": require.resolve(
        "@digitalcredentials/open-badges-context"
      ),
    },
  },
  optimizeDeps: {
    include: ["@digitalcredentials/open-badges-context"],
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
});
