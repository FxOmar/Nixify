export type HttpMethod = "get" | "head" | "put" | "delete" | "post" | "patch" | "options"

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

export interface Options {
	url: string
	headers?: { [key: string]: string }
	hooks?: { beforeRequest: (request: Request, config: Options) => void }
	qs?: StringifyOptions
	timeout?: number | false
}

export type ServiceConfig = { [key: string]: Options }

interface Thenable<U> extends ResponseHandlers<U> {
	then<TResult1 = ResponseHandlers<U>, TResult2 = never>(
		callback: (value: ResponseInterface<U>) => TResult1 | PromiseLike<TResult1>,
	): Promise<TResult1 | TResult2>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequestMethodsType = <U = any>(path: string, options?: MethodConfig) => Thenable<U>

export interface ResponseHandlers<T> {
	json: () => ResponseInterface<T>
	text: () => ResponseInterface<string>
	blob: () => ResponseInterface<Blob>
	arrayBuffer: () => ResponseInterface<ArrayBuffer>
	formData: () => ResponseInterface<FormData>
}

export interface RequestMethods {
	get: RequestMethodsType
	head: RequestMethodsType
	put: RequestMethodsType
	delete: RequestMethodsType
	post: RequestMethodsType
	patch: RequestMethodsType
	options: RequestMethodsType
	beforeRequest: (fn: (request: Request, config: Options) => void) => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export interface MethodConfig extends Omit<RequestInit, "method"> {
	path?: string
	qs?: { [name: string]: queryType | number } // Object of queries.
	json?: object
	responseType?: string
	timeout?: number | false
	//   hooks?: { beforeRequest: (request: Request) => void };
	auth?: boolean | { username: string; password: string }
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
