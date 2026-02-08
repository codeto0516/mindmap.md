import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./setupTests.ts"],
    globals: true,
    css: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/infrastructure/**/*.ts", "src/infrastructure/**/*.tsx", "src/application/**/*.ts"],
      exclude: [
        "node_modules/",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "setupTests.ts",
        "vitest.config.ts",
        "postcss.config.mjs",
        "eslint.config.mjs",
        "**/types.ts",
        "src/app/**",
        "public/**",
        ".next/**",
        "src/infrastructure/repositories/prisma/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
