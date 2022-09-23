import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  outDir: "@Reqeza",
  sourcemap: true,
  clean: true,
  format: "esm",
  platform: "browser",
  target: ["chrome58", "firefox57", "safari11", "edge16"],
  minify: true,
  dts: true,
});
