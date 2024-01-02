require("isomorphic-fetch")
import Reqeza from "../src/index"

jest.mock("isomorphic-fetch")

const BASE_URL = "http://localhost:3001"

const METHODS = ["get", "head", "put", "delete", "post", "patch", "options"]

describe("Creating new instance of http.", () => {
	it("Should create new instance with all services and all http methods [http.local.get()].", async () => {
		const http = Reqeza.create({
			local: {
				url: BASE_URL,
			},
			github: {
				url: "https://gitlab.com/api/v4/",
			},
		})

		expect(http).toHaveProperty("local")
		expect(http).toHaveProperty("github")

		METHODS.forEach((prop) => {
			expect(typeof http.local[prop]).toBe("function")
			expect(http).toHaveProperty(prop) // expect to have all the methods default local config.
		})
	})

	it("Should create new instance without any service! [http.get()].", async () => {
		const http = Reqeza.create()

		METHODS.forEach((prop) => {
			expect(typeof http[prop]).toBe("function")
			expect(http).toHaveProperty(prop)
		})
	})

	it("Should all methods conclude with a function call specifying the responseType?", async () => {
		const http = Reqeza.create()

		const TYPES_METHODS = ["json", "text", "blob", "arrayBuffer", "formData"]

		TYPES_METHODS.forEach(async (prop) => {
			expect(http.get("/hello")).toHaveProperty(prop)
		})
	})
})
