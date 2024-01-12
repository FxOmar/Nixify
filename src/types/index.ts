export type HttpMethod = "get" | "head" | "put" | "delete" | "post" | "patch" | "options"
export type ResponseType = "json" | "text" | "blob" | "arrayBuffer" | "formData"

export type ResponseTypes = {
	json: "application/json"
	text: "text/*"
	formData: "multipart/form-data"
	arrayBuffer: "*/*"
	blob: "*/*"
}

export type XOR<T, U> = T | U extends object
	? (T & Record<string, never>) | (U & Record<string, never>)
	: T | U

type RequestDelayFunction = (attempt: number, response: Response | null) => number

type RequestRetryOnFunction = (
	attempt: number,
	response: Response | null,
) => boolean | Promise<boolean>

export interface RequestInitRetryParams {
	retries?: number | boolean
	retryDelay?: number | RequestDelayFunction
	retryOn?: number[] | RequestRetryOnFunction
}

export interface Options {
	url: string
	headers?: { [key: string]: string }
	hooks?: {
		beforeRequest: (request: Request) => void
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		afterResponse: (request: Request, response: Response, config: any) => void
		beforeRetry: (request: Request, response: Response, attempt: number, delay: number) => void
	}
	qs?: StringifyOptions
	timeout?: number | false
	retryConfig?: RequestInitRetryParams
}

export interface MethodConfig extends Omit<RequestInit, "method"> {
	path?: string
	qs?: { [name: string]: queryType | number } // Object of queries.
	json?: object
	responseType?: ResponseType
	timeout?: number | false
	retry?: RequestInitRetryParams
	// "/groups/:id/registry/repositories" - { id: 4873 }
	// "/groups/4873/registry/repositories"
	params?: { [key: string]: string | number }
	//   hooks?: { beforeRequest: (request: Request) => void };
}

export type ServiceConfig = { [key: string]: Options }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequestMethodsType = <U = any>(
	path: string,
	options?: MethodConfig,
) => XOR<ResponseHandlers<U>, Promise<ResponseInterface<U>>>

export interface ResponseHandlers<T> {
	json: () => Promise<ResponseInterface<T>>
	text: () => Promise<ResponseInterface<string>>
	blob: () => Promise<ResponseInterface<Blob>>
	arrayBuffer: () => Promise<ResponseInterface<ArrayBuffer>>
	formData: () => Promise<ResponseInterface<FormData>>
}

export interface RequestMethods {
	get: RequestMethodsType
	head: RequestMethodsType
	put: RequestMethodsType
	delete: RequestMethodsType
	post: RequestMethodsType
	patch: RequestMethodsType
	options: RequestMethodsType
	beforeRequest: (fn: (request: Request) => void) => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	afterResponse: (fn: (request: Request, response: Response, config: any) => void) => void
	beforeRetry: (
		fn: (request: Request, response: Response, attempt: number, delay: number) => void,
	) => void
	setHeaders: (newHeaders: { [key: string]: string }) => void
}

export type ServiceReqMethods<T extends ServiceConfig> = {
	[K in keyof T]: RequestMethods
}

export interface ResponseInterface<T> {
	data: T
	headers: Headers
	status: number
	statusText: string
	config: Request
}

export type queryType = string | URLSearchParams | Record<string, string> | string[][]

export interface NormalizedOptions extends RequestInit, Omit<Options, "headers"> {
	// eslint-disable-line @typescript-eslint/consistent-type-definitions
	// Extended from `RequestInit`, but ensured to be set (not optional).
	method: NonNullable<RequestInit["method"]>
	credentials: NonNullable<RequestInit["credentials"]>
}

type StringifyOptions = {
	readonly strict?: boolean
	readonly encode?: boolean
	readonly arrayFormat?:
		| "bracket"
		| "index"
		| "comma"
		| "separator"
		| "bracket-separator"
		| "colon-list-separator"
		| "none"
	readonly arrayFormatSeparator?: string
	readonly sort?: ((itemLeft: string, itemRight: string) => number) | false
	readonly skipNull?: boolean
	readonly skipEmptyString?: boolean
}

/**
Stringify an object into a query string and sort the keys.
*/
export type Stringify = (
	// TODO: Use the below instead when the following TS issues are fixed:
	// - https://github.com/microsoft/TypeScript/issues/15300
	// - https://github.com/microsoft/TypeScript/issues/42021
	// Context: https://github.com/sindresorhus/query-string/issues/298
	// object: StringifiableRecord,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	object: Record<string, any>,
	options?: StringifyOptions,
) => string

type CombinedRequestInit = RequestInit

export type RequestInitRegistry = { [K in keyof CombinedRequestInit]-?: true }
