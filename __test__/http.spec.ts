import Nixify from "../src/index"

import { startServer } from "./testing-server"

const BASE_URL = "http://localhost:3001"

let http
let server

describe("Real-life data fetching 🗿.", () => {
	beforeAll(() => {
		server = startServer()

		http = Nixify.create({
			api: {
				url: BASE_URL,
			},
		})
	})

	afterAll(async () => {
		await server.close()
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
	// 	const { data, status } = await Nixify.get<string>(`${BASE_URL}/text`).text()

	// 	expect(status).toBe(200)
	// 	expect(data).toBe("Hello, world")
	// })

	// it("Should fetch data with the given interface.", async () => {
	// 	const { data, status } = await Nixify.get<{ message: string }>(`${BASE_URL}/book`)

	// 	expect(status).toBe(200)
	// 	expect(data.message).toBe("Hello, world")
	// })

	it("Should set header using function helper setHeader", async () => {
		const http2 = Nixify.create({
			local: {
				url: BASE_URL,
			},
		})

		const header = { "Cache-Control": "max-age=604800" }

		http2.local.setHeaders(header)

		const { config } = await http2.local.get("/book").json()

		expect(config.headers.get("Cache-Control")).toEqual(header["Cache-Control"])
	})
})
