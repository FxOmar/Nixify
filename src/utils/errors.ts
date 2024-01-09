/**
 *  https://github.com/sindresorhus/ky/blob/main/source/errors/HTTPError.ts
 */
export class HTTPError extends Error {
	public response: Response
	public request: Request

	constructor(response: Response, request: Request) {
		const code = response.status || response.status === 0 ? response.status : ""
		const title = response.statusText || ""
		const status = `${code} ${title}`.trim()
		const reason = status ? `status code ${status}` : "an unknown error"

		super(`Request failed with ${reason}`)

		this.name = "HTTPError"
		this.response = response
		this.request = request
	}
}

export class TimeoutError extends Error {
	public request: Request

	constructor(request: Request) {
		super("Request timed out")
		this.name = "TimeoutError"
		this.request = request
	}
}
