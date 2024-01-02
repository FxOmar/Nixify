import { defineConfig } from "tsup"

export default defineConfig({
	entryPoints: ["./src/index.ts"],
	entry: ["./src/**/*.ts"],
	outDir: "@Reqeza",
	clean: true,
	format: "esm",
	platform: "browser",
	target: "es2020",
	bundle: true,
	skipNodeModulesBundle: true,
	minify: true,
	dts: true,
	splitting: true,
	treeshake: true,
})
