import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { execSync } from "child_process";

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
      {
        name: "postbuild-trigger",
        closeBundle() {
          try {
            console.log("Vite closeBundle: Triggering postbuild script...");
            execSync("node postbuild.cjs", { stdio: "inherit" });
          } catch (e: any) {
            console.warn("Vite closeBundle: Postbuild trigger failed:", e.message);
          }
        },
      },
    ],
    server: {
      port: 8080,
      host: true,
      strictPort: false,
      cors: true,
    },
  },
});
