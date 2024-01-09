import fetchMock from "jest-fetch-mock"

import Reqeza from "../src/index"
import { HTTPError, TimeoutError } from "../src/utils/errors"

const BASE_URL = "http://localhost:3001"

const METHODS = ["get", "head", "put", "delete", "post", "patch", "options"]

describe("Reqeza functionalities 🚀.", () => {
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

	it("Should all methods conclude a function call specifying the responseType?", async () => {
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

	it("Should send request without timeout.", async () => {
		const http = Reqeza.create({
			local: {
				url: BASE_URL,
				timeout: false,
			},
		})

		fetchMock.mockResponseOnce(
			() => new Promise((resolve) => setTimeout(() => resolve({ body: "ok" }), 200)),
		)

		const { data } = await http.get("/book").text()

		expect(data).toBe("ok")
	})

	it("Should Ensure proper merging of method header and global header", async () => {
		const CacheHeader = { "Cache-Control": "max-age=604800" }
		const DateHeader = { Date: "Tue, 21 Dec 2021 08:00:00 GMT" }

		const http2 = Reqeza.create({
			api: {
				url: BASE_URL,
				headers: {
					"x-key-api": "[API_TOKEN]",
				},
			},
			local: {
				url: BASE_URL,
				headers: {
					"X-Requested-By": "Reqeza",
				},
			},
		})

		http2.setHeaders(CacheHeader)

		const StoredHeaders = {
			"x-key-api": "[API_TOKEN]",
			"X-Requested-By": "Reqeza",
			...CacheHeader,
			...DateHeader,
		}

		const http = Reqeza.create({
			github: {
				url: "https://api.github.com",
			},
		})

		http.beforeRequest((request) => {
			request.headers.set("X-API-KEY", "[GITHUB_TOKEN]")
		})

		fetchMock.mockResponseOnce(JSON.stringify({ data: "12345" }), {
			status: 200,
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
			},
		})

		const { config } = await http2.api.get("/book").json()
		const {
			config: { headers },
		} = await http2.local.get("/book", { headers: DateHeader }).json()

		const {
			config: { headers: GithubHeaders },
		} = await http.get("/book").json()

		// Both services should have `Cache-Control`
		expect(config.headers.get("Cache-Control")).toBe(StoredHeaders["Cache-Control"])
		expect(headers.get("Cache-Control")).toBe(StoredHeaders["Cache-Control"])

		// Api should have `x-key-api`
		expect(config.headers.get("x-key-api")).toBe(StoredHeaders["x-key-api"])
		// Local should have `X-Requested-By`
		expect(headers.get("X-Requested-By")).toBe(StoredHeaders["X-Requested-By"])

		// Local should have `Date` Api not
		expect(config.headers.has("Date")).toBeFalsy()
		expect(headers.has("Date")).toBeTruthy()
		expect(headers.get("Date")).toBe(StoredHeaders["Date"])

		// Should set header `beforeRequest`
		expect(GithubHeaders.has("X-API-KEY")).toBeTruthy()

		// Check if header was passed globally
		expect([
			config.headers.has("Cache-Control"),
			headers.has("Cache-Control"),
			GithubHeaders.has("Cache-Control"),
		]).toEqual([true, true, false])
	})

	it("Should accept queries as a request option.", async () => {
		const http = Reqeza.create({
			api: {
				url: BASE_URL,
				qs: {
					arrayFormat: "bracket",
				},
			},
		})

		const fakeDate = { name: "Rich dad, Poor dad" }

		fetchMock.mockResponseOnce(JSON.stringify({ message: fakeDate.name }), {
			status: 200,
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
			},
		})

		const { data, config } = await http.api.get<{ message: string }>("/book", {
			qs: { ...fakeDate, limit: 5 },
		})

		const url = new URL(config.url)

		expect(url.searchParams.toString()).toMatch("limit=5&name=Rich+dad%2C+Poor+dad")
		expect(data).toEqual({ message: fakeDate.name })
	})

	it("Should send URLSearchParams as body.", async () => {
		const http = Reqeza.create({
			api: {
				url: BASE_URL,
			},
		})

		const title = "Think and grow rich"

		fetchMock.mockResponseOnce(JSON.stringify({ message: title }), {
			status: 200,
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
			},
		})

		const { status, config } = await http.api
			.post("/book", {
				body: new URLSearchParams({ title }),
			})
			.json()

		expect(status).toBe(200)
		expect(config.headers.get("Content-Type")).toMatch(
			"application/x-www-form-urlencoded;charset=UTF-8",
		)
	})
})

describe("Error handling ❌", () => {
	beforeAll(() => {
		fetchMock.enableMocks()
	})
	beforeEach(() => {
		fetchMock.resetMocks()
	})

	it("Should cancel request and throw TimeoutError.", async () => {
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
			expect(error).toBeInstanceOf(TimeoutError)
			expect(error.name).toMatch("TimeoutError")
			expect(error.message).toMatch("Request timed out")
		}
	})

	it("Should throw TypeError if protocol not https/http.", async () => {
		const http = Reqeza.create({
			local: {
				url: "file://example.com",
			},
		})

		fetchMock.mockResponseOnce(JSON.stringify({ data: "2343" }), { status: 200 })

		try {
			await http.get("/book").json()
		} catch (error) {
			expect(error).toBeInstanceOf(TypeError)
			expect(error.name).toMatch("TypeError")
			expect(error.message).toMatch("Unsupported protocol, file:")
		}
	})

	it("Should throw HTTPError response for non-2xx.", async () => {
		const http = Reqeza.create({
			local: {
				url: BASE_URL,
			},
		})

		fetchMock.mockResponseOnce(null, { status: 404 })

		try {
			await http.get("/book").json()
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPError)
			expect(error.name).toMatch("HTTPError")
			expect(error.message).toMatch("Request failed with status code 404 Not Found")
		}
	})

	it("Should throw TypeError in Unsupported responseType.", async () => {
		const http = Reqeza.create({
			local: {
				url: BASE_URL,
			},
		})

		fetchMock.mockResponseOnce(JSON.stringify({ data: "void" }), {
			status: 200,
			headers: {
				"Content-Type": "application/json;",
			},
		})

		try {
			await http.get("/book").formData()
		} catch (error) {
			expect(error).toBeInstanceOf(TypeError)
			expect(error.message).toMatch(
				'Unsupported response type "formData" specified in the request. The Content-Type of the response is "application/json;".',
			)
		}
	})
})
