import fetchMock from "jest-fetch-mock"

import Reqeza from "../src/index"

const BASE_URL = "http://localhost:3001"

const METHODS = ["get", "head", "put", "delete", "post", "patch", "options"]

describe("Creating new instance of http.", () => {
	beforeAll(() => {
		fetchMock.enableMocks()
	})
	beforeEach(() => {
		fetchMock.resetMocks()
	})
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
			expect(http.local).toHaveProperty(prop) // expect to have all the methods default local config.
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

	it("Should calls beforeRequest before making requests.", async () => {
		const http = Reqeza.create({
			local: {
				url: BASE_URL,
			},
		})

		fetchMock.mockResponseOnce(JSON.stringify({ data: "12345" }), {
			status: 200,
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
			},
		})

		const beforeRequestMock = jest.fn()

		http.local.beforeRequest(beforeRequestMock)

		await http.local.get("/book").json()
		await http.local.get("/book", { responseType: "text" })
		await http.local.get("/book").text()

		expect(beforeRequestMock).toHaveBeenCalled()
		expect(beforeRequestMock).toHaveBeenCalledTimes(3) // Adjust the number based on your use case
	})

	it("Should cancel request and throw timeout error.", async () => {
		const http = Reqeza.create({
			local: {
				url: BASE_URL,
				timeout: 50,
			},
		})

		fetchMock.mockResponseOnce(
			() => new Promise((resolve) => setTimeout(() => resolve({ body: "ok" }), 200)),
		)

		try {
			await http.get("/book").text()
		} catch (error) {
			expect(error.name).toMatch("TimeoutError")
			expect(error.message).toMatch("Request timed out")
		}
	})
})
