import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// SPA build — no nitro/SSR, produces dist/client with _shell.html → index.html
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: {
      enabled: true,
    },
    tsr: {
      autoCodeSplitting: false,
    },
  },
  vite: {
    server: {
      port: 8080,
      host: true,
      strictPort: false,
      cors: true,
    },
  },
});
