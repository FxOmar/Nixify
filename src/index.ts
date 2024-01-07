import type {
	HttpMethod,
	MethodConfig,
	Options,
	RequestMethods,
	ResponseInterface,
	ServiceConfig,
	ServiceReqMethods,
	XOR,
} from "./types"
import { isEmpty, setHeaders, mergeConfigs, filterRequestOptions } from "./utils"
import { NetworkError, ResponseError } from "./utils/errors"
import timeout from "./utils/timeout"

// All the HTTP request methods.
const methods = ["get", "head", "put", "delete", "post", "patch", "options"] as const

const responseTypes = {
	json: "application/json",
	text: "text/*",
	formData: "multipart/form-data",
	arrayBuffer: "*/*",
	blob: "*/*",
} as const

const __requestConfig = (config): Request => {
	if (config.url.protocol !== "https:" && config.url.protocol !== "http:") {
		throw new TypeError(`Unsupported protocol, ${config.url.protocol}`)
	}

	/**
	 * if body is json, then set headers to content-type JSON
	 */
	if (config?.json) {
		config.body = JSON.stringify(config.json)
		config.headers.append("Content-Type", "application/json; charset=UTF-8")
		delete config.json
	}

	const request = filterRequestOptions(config)

	return new Request(config.url.toString(), request)
}

const _fetch = async (request: Request, config) => {
	if (config?.hooks) {
		config.hooks.beforeRequest(request, config)
	}

	if (config.timeout === false) {
		return fetch(request.clone())
	}

	return timeout(request.clone(), config.abortController, config.timeout)
}

/**
 * HttpAdapter for making http requests 🦅 to the given API'S.
 *
 * @returns {Promise<ResponseInterface>}
 */
const httpAdapter = async <R>(config: Options, method: HttpMethod, methodConfig: MethodConfig) => {
	const _config = mergeConfigs(config, methodConfig, method)
	const requestConfig = __requestConfig(_config)

	return new Promise((resolve, reject) => {
		_fetch(requestConfig, _config)
			.then((res) => ResponseError(res, requestConfig, _config))
			.then(async (res) => {
				// Response Schema
				const response: Partial<ResponseInterface<R>> = {
					headers: res.headers,
					status: res.status,
					statusText: res.statusText,
					config: requestConfig,
				}

				// Validate and handle responseType
				if (_config.responseType) {
					try {
						response.data = await res[_config.responseType]()
					} catch (error) {
						// Handle parsing error for the specified responseType
						throw new Error(
							`Unsupported response type "${
								_config.responseType
							}" specified in the request. The Content-Type of the response is "${res.headers.get(
								"Content-Type",
							)}".`,
						)
					}
				} else {
					// If no responseType is specified, default to "json"
					response.data = await res.json()
				}

				resolve(response)
			})
			.catch((error) => {
				if (error.name === "TimeoutError") {
					throw new Error(error)
				} else if (error.name === "AbortError") {
					throw new Error(error)
				} else {
					// A network error, or some other problem.
					throw new NetworkError(requestConfig, error.message)
				}
			})
	})
}

const createHTTPMethods = (config?: Options): RequestMethods => {
	const httpShortcuts = {}

	/**
	 * Build methods shortcut *Http.get().text()*.
	 */
	methods.forEach((method) => {
		httpShortcuts[method] = (path: string, options?: MethodConfig) => {
			let responseType = "json"

			if (options?.auth && typeof options?.auth === "object") {
				const { username, password } = options.auth
				const encodedToken = Buffer.from(`${username}:${password}`).toString("base64")
				setHeaders(config?.headers, { Authorization: `Basic ${encodedToken}` })
			}

			const responseHandlers = {
				...Object.fromEntries(
					Object.entries(responseTypes).map(([typeName, mimeType]) => [
						typeName,
						() => {
							setHeaders((config.headers = config?.headers || {}), {
								accept: mimeType,
							})

							responseType = typeName
							return responseHandlers
						},
					]),
				),
				then(callback) {
					httpAdapter(config, method, { path, responseType, ...options }).then(callback)
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
 * http.beforeRequest(request => {
 *   // Modify request headers or perform other actions
 * });
 *
 * await http.github.get('/search/repositories').json();
 */
const create = <T extends ServiceConfig>(config?: T) => {
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

	const forEachInstance = (arg) => Object.values(instances).forEach(arg)

	const updateHeadersAcrossInstances = (newHeaders) =>
		forEachInstance((instance) => instance.setHeaders(newHeaders))

	const beforeRequestAcrossInstances = (fn) =>
		forEachInstance((instance) => instance.beforeRequest(fn))

	const resultingInstances = isEmpty(config)
		? { ...instances.default }
		: {
				...instances,
				...instances[Object.keys(instances)[0]],
				beforeRequest: (fn) => beforeRequestAcrossInstances(fn),
				setHeaders: (newHeaders) => updateHeadersAcrossInstances(newHeaders),
			}

	return resultingInstances as XOR<ServiceReqMethods<T>, RequestMethods>
}

export default { create }
