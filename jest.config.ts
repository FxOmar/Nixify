import type { Config } from "jest"

const config: Config = {
	preset: "ts-jest",
	// Automatically clear mock calls and instances between every test
	clearMocks: true,
	// The directory where Jest should output its coverage files
	coverageDirectory: "coverage",
	// An array of file extensions your modules use
	moduleFileExtensions: ["js", "ts"],
}

export default config
