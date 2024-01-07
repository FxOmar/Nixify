import { NormalizedOptions } from "../types"

/**
 *  https://github.com/sindresorhus/ky/blob/main/source/errors/HTTPError.ts
 */
export class HTTPError extends Error {
	public response: Response
	public request: Request
	public options: NormalizedOptions

	constructor(response: Response, request: Request, options: NormalizedOptions) {
		const code = response.status || response.status === 0 ? response.status : ""
		const title = response.statusText || ""
		const status = `${code} ${title}`.trim()
		const reason = status ? `status code ${status}` : "an unknown error"

		super(`Request failed with ${reason}`)

		this.name = "HTTPError"
		this.response = response
		this.request = request
		this.options = options
	}
}

export function ResponseError(response, request, config) {
	// non-2xx HTTP responses into errors:
	if (!response.ok) {
		throw new HTTPError(response, request, config)
	}

	return response
}

export class TimeoutError extends Error {
	public request: Request

	constructor(request: Request) {
		super("Request timed out")
		this.name = "TimeoutError"
		this.request = request
	}
}

export class NetworkError extends Error {
	public request: Request

	constructor(request: Request, message: string) {
		super(message)
		this.name = "NetworkError"
		this.request = request
	}
}
