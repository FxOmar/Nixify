import type {
	MethodConfig,
	Options,
	RequestMethods,
	RequestMethodsType,
	ResponseInterface,
	ServiceConfig,
	ServiceReqMethods,
	XOR,
} from "./interfaces"
import { mergeHeaders, isEmpty, setHeaders } from "./utils"
import { ResponseError } from "./utils/errors"
import { qs } from "./utils/qs"

const headers = {} // Initial headers

const __configuration = (
	config: Options,
	methodConfig: MethodConfig,
	method: NonNullable<RequestInit["method"]>,
): Request => {
	const BASE_URL = new URL(methodConfig.path, config?.url ?? undefined)

	if (BASE_URL.protocol !== "https:" && BASE_URL.protocol !== "http:") {
		throw new TypeError(`Unsupported protocol, ${BASE_URL.protocol}`)
	}

	if (methodConfig.signal && !(methodConfig.signal instanceof AbortSignal))
		throw new TypeError(
			typeof methodConfig.signal + " received for signal, but expected an AbortSignal",
		)

	// https://felixgerschau.com/js-manipulate-url-search-params/
	// Add queries to the url
	methodConfig?.qs ? (BASE_URL.search = qs.stringify(methodConfig.qs, config?.qs)) : null

	let headersConfig = new Headers({
		...headers,
		...config?.headers,
	})

	/**
	 * if body is json, then set headers to content-type JSON
	 */
	if (methodConfig?.json) {
		methodConfig.body = JSON.stringify(methodConfig.json)
		headersConfig.append("Content-Type", "application/json; charset=UTF-8")
		delete methodConfig.json
	}

	if (methodConfig?.body instanceof URLSearchParams) {
		headersConfig.append("Content-Type", "application/x-www-form-urlencoded;charset=utf-8")
	}

	if (methodConfig.headers) {
		headersConfig = mergeHeaders(headersConfig, methodConfig.headers)
	}

	return new Request(BASE_URL.toString(), {
		method: method.toLocaleUpperCase(),
		headers: headersConfig,
		/*
		 * Note: The body type can only be a Blob, BufferSource, FormData, URLSearchParams,
		 * USVString or ReadableStream type,
		 * so for adding a JSON object to the payload you need to stringify that object.
		 */
		body: methodConfig.body,

		// Cancel request
		signal: methodConfig.signal,
		cache: methodConfig.cache,
		credentials: methodConfig.credentials,
		integrity: methodConfig.integrity,
		keepalive: methodConfig.keepalive,
		mode: methodConfig.mode,
		redirect: methodConfig.redirect,
		referrer: methodConfig.referrer,
		referrerPolicy: methodConfig.referrerPolicy,
	})
}

/**
 * HttpAdapter for making http requests 🦅 to the given API'S.
 *
 * @returns {Promise<ResponseInterface>}
 */
const httpAdapter = async <R>(
	config: Options,
	method: NonNullable<RequestInit["method"]>,
	methodConfig: MethodConfig,
) => {
	const requestConfig = __configuration(config, methodConfig, method)

	if (config?.hooks) {
		await config.hooks.beforeRequest(requestConfig)
	}

	return fetch(requestConfig)
		.then((res) => ResponseError(res, requestConfig, config))
		.then(async (res) => {
			/**
			 * Retrieve response Header.
			 *
			 * @param headers
			 * @returns Response Headers
			 */
			const retrieveHeaders = () => {
				const headers = {}
				for (const pair of res.headers.entries()) {
					headers[pair[0]] = pair[1]
				}

				return headers
			}

			// Response Schema
			const response: Partial<ResponseInterface<R>> = {
				headers: retrieveHeaders(),
				status: res.status,
				statusText: res.statusText,
				config: requestConfig,
			}

			// Validate and handle responseType
			if (methodConfig.responseType) {
				try {
					response.data = await res[methodConfig.responseType]()
				} catch (error) {
					// Handle parsing error for the specified responseType
					throw new Error(
						`Unsupported response type "${
							methodConfig.responseType
						}" specified in the request. The Content-Type of the response is "${res.headers.get(
							"Content-Type",
						)}".`,
					)
				}
			} else {
				// If no responseType is specified, default to "json"
				response.data = await res.json()
			}

			return response
		})
}

const createHTTPMethods = (config?: Options): RequestMethods => {
	// All the HTTP request methods.
	const methods = ["get", "head", "put", "delete", "post", "patch", "options"] as const

	const responseTypes = {
		json: "application/json",
		text: "text/*",
		formData: "multipart/form-data",
		arrayBuffer: "*/*",
		blob: "*/*",
	} as const

	const httpShortcuts = {}

	/**
	 * Build methods shortcut *Http.get().text()*.
	 */
	methods.forEach((method) => {
		httpShortcuts[method] = (path: string, options?: MethodConfig): RequestMethodsType => {
			let responseType = "json"

			if (typeof options?.auth === "object") {
				// Add Basic Authorization header
				const token = `${options.auth.username}:${options.auth.password}`
				const encodedToken = Buffer.from(token).toString("base64")

				setHeaders(config?.headers, {
					Authorization: `Basic ${encodedToken}`,
				})
			}

			// Response types methods generator.
			const responseHandlers = {
				...Object.assign(
					{},
					...Object.entries(responseTypes).map(([typeName, mimeType]) => ({
						[typeName]: () => {
							setHeaders(headers, { accept: mimeType })
							responseType = typeName

							return responseHandlers
						},
					})),
				),
				// https://javascript.plainenglish.io/the-benefit-of-the-thenable-object-in-javascript-78107b697211
				then(callback) {
					httpAdapter(config, method, {
						path,
						responseType,
						...options,
					}).then(callback)
				},
			}

			return responseHandlers
		}
	})

	return httpShortcuts as RequestMethods
}

/**
 * Factory function for creating an HTTP client with configurable service instances.
 *
 * @function create
 * @param {Object} [config=null] - Configuration object for defining service instances with their respective URLs and headers.
 * @returns {Object} An HTTP client with service instances and utility functions.
 * @property {Object} {service} - Individual service instance with methods for making HTTP requests.
 * @property {Function} {service}.setHeaders - Sets headers for a specific service instance.
 * @property {Function} {service}.beforeRequest - Service-specific hook to edit request before making HTTP requests for a specific service.
 *
 * @example
 * const http = Reqeza.create({
 *    github: {
 *      url: "https://api.github.com",
 *      headers: {
 *        "x-API-KEY": "[TOKEN]"
 *      }
 *    },
 *    gitlab: {
 *      url: "https://gitlab.com/api/v4/",
 *      headers: {}
 *    },
 * });
 *
 * // Set headers for a specific service instance
 * http.gitlab.setHeaders({ "authorization": `Bearer ${token}` });
 *
 * // Set headers before making a request for a specific service instance
 * http.gitlab.beforeRequest(request => {
 *   // Modify request headers or perform other actions
 * });
 *
 * await http.github.get('/search/repositories').json();
 */
const create = <T extends ServiceConfig>(config?: T): XOR<ServiceReqMethods<T>, RequestMethods> => {
	const instances = Object.fromEntries(
		Object.entries(config || { default: {} }).map(([service, serviceConfig]) => [
			service,
			{
				...createHTTPMethods(serviceConfig),
				beforeRequest: (callback) => {
					if (serviceConfig?.hooks?.beforeRequest) {
						throw new TypeError(
							"beforeRequest has already been invoked within configuration.",
						)
					}

					serviceConfig.hooks = {}
					serviceConfig.hooks.beforeRequest = callback
				},
				setHeaders: (newHeaders) =>
					setHeaders((serviceConfig.headers = serviceConfig.headers || {}), newHeaders),
			},
		]),
	)

	const resultingInstances = isEmpty(config)
		? { ...instances.default }
		: {
				...instances,
				...instances[Object.keys(instances)[0]],
				setHeaders: (newHeaders) => setHeaders(headers, newHeaders),
			}

	return resultingInstances as XOR<ServiceReqMethods<T>, RequestMethods>
}

export default { create }
