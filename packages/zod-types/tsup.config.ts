import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  splitting: false,
  bundle: true,
  keepNames: true,
  minify: false,
  dts: true,
  outExtension() {
    return {
      js: ".js",
    };
  },
  external: ["zod"],
});
