import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { redact } from "@tanstack/redact/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
  environments: {
    ssr: {
      build: {
        rolldownOptions: {
          external: ["cloudflare:workers"],
          input: "./src/server.ts",
        },
      },
    },
  },
  plugins: [tanstackStart(), viteReact(), tailwindcss(), redact(), nitro()],
  resolve: { tsconfigPaths: true },
  server: { port: 3000 },
});

export default config;
