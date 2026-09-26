import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        auth: resolve(root, "auth.html"),
        community: resolve(root, "community.html"),
        article: resolve(root, "article.html"),
        editor: resolve(root, "editor.html"),
        moderation: resolve(root, "moderation.html"),
      },
    },
  },
});
