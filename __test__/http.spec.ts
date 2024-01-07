// require("isomorphic-fetch")
import Reqeza from "../src/index"

import { startServer } from "./testing-server"

const BASE_URL = "http://localhost:3001"

let http
let server

describe("HTTP functionalities", () => {
	beforeAll(() => {
		server = startServer()

		http = Reqeza.create({
			api: {
				url: BASE_URL,
			},
		})
	})

	afterAll(async () => {
		server.close()
	})

	it("Should fetch data from API.", async () => {
		const { data, status } = await http.api.get("/text").text()

		expect(status).toBe(200)
		expect(data).toBe("Hello, world")
	})

	it("Should send POST request to API.", async () => {
		const title = "Think and grow rich"

		const { data, status } = await http.api
			.post("/book", {
				json: {
					title,
				},
			})
			.json()

		const res = {
			title,
			message: "Book added successfully.",
		}

		expect(status).toBe(200)
		expect(data).toEqual(res)
	})

	it("Should parse response with json by default.", async () => {
		const { data, status } = await http.api.get("/book")

		expect(status).toBe(200)

		expect(typeof data).toBe("object")
	})

	// it("Should fetch without creating new instance.", async () => {
	// 	const { data, status } = await Reqeza.get<string>(`${BASE_URL}/text`).text()

	// 	expect(status).toBe(200)
	// 	expect(data).toBe("Hello, world")
	// })

	// it("Should fetch data with the given interface.", async () => {
	// 	const { data, status } = await Reqeza.get<{ message: string }>(`${BASE_URL}/book`)

	// 	expect(status).toBe(200)
	// 	expect(data.message).toBe("Hello, world")
	// })

	it("Should change header before sending request to all services.", async () => {
		const headers = { Authorization: "[llll_TOKEN]" }

		const http3 = Reqeza.create({
			local: {
				url: BASE_URL,
				headers: {
					"x-custom": "[nothing]",
					"X-API-KEY": "[TOKEN]",
				},
			},
			local2: {
				url: BASE_URL,
				headers: {
					"x-custom": "[nothing]",
				},
			},
		})

		http3.setHeaders(headers)

		const { config: opt } = await http3.local2.get("/book").json()

		expect(opt.headers.get("Authorization")).toBe(headers.Authorization)
	})

	it("Should set header using function helper setHeader", async () => {
		const http2 = Reqeza.create({
			local: {
				url: BASE_URL,
			},
		})

		const header = { "Cache-Control": "max-age=604800" }

		http2.local.setHeaders(header)

		const { config } = await http2.local.get("/book").json()

		expect(config.headers.get("Cache-Control")).toEqual(header["Cache-Control"])
	})

	it("Should Ensure proper merging of method header and global header", async () => {
		const http2 = Reqeza.create({
			api: {
				url: BASE_URL,
				headers: {
					"Custom-Header": "customValue",
				},
			},
			local: {
				url: BASE_URL,
				headers: {
					"Custom-Header": "customValue",
				},
			},
		})

		const http = Reqeza.create({
			api: {
				url: BASE_URL,
			},
		})

		const header = { "Cache-Control": "max-age=604800" }
		const customHeader = { Date: "Tue, 21 Dec 2021 08:00:00 GMT" }

		http2.setHeaders(header)

		const { config } = await http2.api.get("/book").json()
		const {
			config: { headers },
		} = await http2.local.get("/book", { headers: customHeader }).json()

		const {
			config: { headers: headersA },
		} = await http.api.get("/book").json()

		const expectedHeaders = expect.objectContaining(config.headers)

		expect(config.headers.get("Cache-Control")).toBe(header["Cache-Control"])
		expect(config.headers.get("Date")).toBeNull()
		expect(config.headers.get("Custom-Header")).toBe("customValue")
		expect(headers.get("Date")).toBe(customHeader.Date)

		// Check if it have global headers
		expect(headers).toEqual(expectedHeaders)
		expect([
			headers.get("Cache-Control"),
			config.headers.get("Cache-Control"),
			headersA.get("Cache-Control"),
		]).toEqual(["max-age=604800", "max-age=604800", null])
	})

	it("Intercepting requests by invoking `beforeRequest` should be ensured.", async () => {
		const http2 = Reqeza.create({
			local: {
				url: BASE_URL,
			},
			gitlab: {
				url: BASE_URL,
			},
		})

		http2.local.beforeRequest((request) => {
			request.headers.set("X-API-KEY", "[GITHUB_TOKEN]")
		})

		const { config } = await http2.local.get("/book").json()

		expect(config.headers.get("X-API-KEY")).toBe("[GITHUB_TOKEN]")
	})

	it("Should Set headers if no services are provided.", async () => {
		const headers = { "X-API-KEY": "[LOCAL_TOKEN]" }

		const http = Reqeza.create()

		http.setHeaders(headers)

		const { status, config } = await http.get(`${BASE_URL}/book`)

		expect(status).toBe(200)
		expect(config.headers.get("X-API-KEY")).toBe(headers["X-API-KEY"])
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

		const { data, config } = await http.api.get<{ message: string }>("/book", {
			qs: { ...fakeDate, limit: 5 },
		})

		const url = new URL(config.url)

		expect(fakeDate.name).toBe(url.searchParams.get("name"))

		expect(data).toEqual({ message: fakeDate.name })
	})

	it("Should send URLSearchParams as body.", async () => {
		const http = Reqeza.create({
			api: {
				url: BASE_URL,
			},
		})

		const title = "Think and grow rich"

		const { status, config } = await http.api
			.post("/book", {
				body: new URLSearchParams({ title }),
			})
			.json()

		expect(status).toBe(200)
		expect(config.headers.get("Content-Type")).toBe(
			"application/x-www-form-urlencoded;charset=UTF-8",
		)
	})
})
