import { defineConfig } from "tsup"

export default defineConfig({
	entry: ["./src/index.ts"],
	outDir: "@Reqeza",
	clean: true,
	format: "esm",
	platform: "browser",
	target: "es2015",
	minify: true,
	dts: true,
})
