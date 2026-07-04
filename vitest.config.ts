import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Vitest config. Mirrors the `@/*` -> `./src/*` alias from tsconfig.json so
 * unit tests can import modules the same way app code does.
 *
 * JSX: tsconfig sets `jsx: "preserve"` (Next.js compiles JSX itself), which
 * esbuild refuses to transform. Tests that import a `.tsx` card template need
 * real JSX transformation, so we opt into the automatic runtime here. Satori
 * consumes the resulting `jsx()` element tree just like React would.
 */
export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "react",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
