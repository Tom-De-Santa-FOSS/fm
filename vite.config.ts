import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { redact } from "@tanstack/redact/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
  plugins: [tanstackStart(), viteReact(), tailwindcss(), redact()],
  resolve: { tsconfigPaths: true },
  ssr: { noExternal: true },
});

export default config;
