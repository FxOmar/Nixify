import type {
	HttpMethod,
	MethodConfig,
	Options,
	RequestMethods,
	ResponseTypes,
	ResponseType,
	ServiceConfig,
	ServiceReqMethods,
	XOR,
} from "./types"
import { isEmpty, setHeaders, mergeConfigs, filterRequestOptions } from "./utils"
import timeout from "./utils/timeout"
import json from "./utils/json-parse"
import { HTTPError } from "./utils/errors"

// All the HTTP request methods.
const methods = ["get", "head", "put", "delete", "post", "patch", "options"] as const

const responseTypes = {
	json: "application/json",
	text: "text/*",
	formData: "multipart/form-data",
	arrayBuffer: "*/*",
	blob: "*/*",
} as ResponseTypes

const _request = (config): Request => {
	if (config.url.protocol !== "https:" && config.url.protocol !== "http:") {
		throw new TypeError(`Unsupported protocol, ${config.url.protocol}`)
	}

	const request = filterRequestOptions(config)

	return new Request(config.url.toString(), request)
}

const _fetch = async (request: Request, config) => {
	if (config?.hooks?.beforeRequest) {
		await config.hooks.beforeRequest(request)
	}

	if (config.timeout === false) {
		return await fetch(request.clone())
	}

	return timeout(request.clone(), config.abortController, config.timeout)
}

/**
 * HttpAdapter make http requests 🦅.
 *
 * @returns {Promise<ResponseInterface<U>>}
 */
const httpAdapter = async (config: Options, method: HttpMethod, methodConfig: MethodConfig) => {
	const _config = mergeConfigs(config, methodConfig, method)
	const request = _request(_config)

	const response = await _fetch(request, _config)

	// Still under development
	if (config?.hooks?.afterResponse) {
		delete _config.abortController

		response.json = async () => json.parse(await response.clone().text())

		await config.hooks.afterResponse(request, response, _config)
	}

	// non-2xx HTTP responses into errors:
	if (!response.ok) {
		throw new HTTPError(response.clone(), request)
	}

	// Response Schema
	const _response = {
		data: null,
		headers: response.headers,
		status: response.status,
		statusText: response.statusText,
		config: request,
	}

	const awaitedResponse = response.clone()

	const parseResponse = async () => {
		if (_config.responseType === "json") {
			// https://datatracker.ietf.org/doc/html/rfc2616#section-10.2.5
			if (response.status === 204) return ""

			const data = await awaitedResponse.text()

			if (data.length === 0) {
				return ""
			}

			// JSON.parse() replacement with prototype poisoning protection.
			return json.parse(data)
		}

		return await awaitedResponse[_config.responseType]()
	}

	// Validate and handle responseType
	if (_config.responseType) {
		try {
			_response.data = await parseResponse()
		} catch (error) {
			// Handle parsing error for the specified responseType
			throw new TypeError(
				`Unsupported response type "${
					_config.responseType
				}" specified in the request. The Content-Type of the response is "${response.headers.get(
					"Content-Type",
				)}".`,
			)
		}
	}

	return _response
}

const createHTTPMethods = (config?: Options): RequestMethods => {
	const httpShortcuts = {}

	/**
	 * Build methods shortcut *Http.get().text()*.
	 */
	methods.forEach((method) => {
		httpShortcuts[method] = (path: string, options?: MethodConfig) => {
			// If no responseType is specified, default to "json"
			let responseType = options?.responseType || "json"

			const responseHandlers = {
				...Object.fromEntries(
					Object.entries(responseTypes).map(([typeName, mimeType]) => [
						typeName,
						() => {
							setHeaders((config.headers = config?.headers || {}), {
								accept: mimeType,
							})

							responseType = typeName as ResponseType

							return responseHandlers
						},
					]),
				),
				// https://javascript.plainenglish.io/the-benefit-of-the-thenable-object-in-javascript-78107b697211
				then(...callback) {
					return httpAdapter(config, method, { path, responseType, ...options }).then(
						...callback,
					)
				},
				catch(callback) {
					return responseHandlers.then().catch(callback)
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
				beforeRequest: (fn) => {
					if (serviceConfig?.hooks?.beforeRequest) {
						throw new TypeError(
							"beforeRequest has already been invoked within configuration.",
						)
					}

					serviceConfig.hooks = {}
					serviceConfig.hooks.beforeRequest = fn
				},
				afterResponse: (fn) => {
					if (serviceConfig?.hooks?.afterResponse) {
						throw new TypeError(
							"afterResponse has already been invoked within configuration.",
						)
					}

					serviceConfig.hooks = {}
					serviceConfig.hooks.afterResponse = fn
				},
				setHeaders: (newHeaders) =>
					setHeaders((serviceConfig.headers = serviceConfig.headers || {}), newHeaders),
			},
		]),
	)

	const forEachInstance = (arg) => Object.values(instances).forEach(arg)

	const resultingInstances = isEmpty(config)
		? { ...instances.default }
		: {
				...instances,
				...instances[Object.keys(instances)[0]],
				beforeRequest: (fn) => forEachInstance((instance) => instance.beforeRequest(fn)),
				afterResponse: (fn) => forEachInstance((instance) => instance.afterResponse(fn)),
				setHeaders: (newHeaders) =>
					forEachInstance((instance) => instance.setHeaders(newHeaders)),
			}

	return resultingInstances as XOR<ServiceReqMethods<T>, RequestMethods>
}

export default { create }
