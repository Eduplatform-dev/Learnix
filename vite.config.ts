import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    proxy: {
      // Optionally proxy /api to backend during dev so you avoid CORS issues
      // '/api': 'http://localhost:5000',
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ["react", "react-dom", "react-router-dom"],
          recharts: ["recharts"],
          radix:    [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
          ],
        },
      },
    },
  },

  test: {
    globals:     true,
    environment: "jsdom",
    setupFiles:  ["./src/test/setup.ts"],
    include:     ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include:  ["src/app/services/**", "src/app/providers/**"],
    },
  },
});