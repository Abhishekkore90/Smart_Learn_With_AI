import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { execSync } from "child_process";
import { nitro } from "nitro/vite";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    tsr: {
      autoCodeSplitting: false,
    },
  },
  vite: {
    plugins: [
      nitro({ preset: "vercel" }),
    ],
    server: {
      port: 8080,
      host: true,
      strictPort: false,
      cors: true,
    },
  },
});
