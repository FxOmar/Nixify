import type { HttpMethod, MethodConfig, Options } from "../types"
import { qs } from "./qs"

export function isEmpty(target) {
	return target === null || target === undefined || Object.keys(target).length === 0
}

export function mergeHeaders(baseHeaders: Headers, additionalHeaders: HeadersInit): Headers {
	const mergedHeaders = new Headers(baseHeaders)

	if (additionalHeaders instanceof Headers) {
		// If additionalHeaders is a Headers object, iterate over its entries
		additionalHeaders.forEach((value, key) => {
			mergedHeaders.append(key, value)
		})
	} else if (typeof additionalHeaders === "object") {
		// If additionalHeaders is a plain object, iterate over its properties
		for (const [key, value] of Object.entries(additionalHeaders)) {
			mergedHeaders.append(key, value)
		}
	}

	return mergedHeaders
}

// Regular expression for a valid HTTP header name
const isValidHeaderName = (name) => /^[!#$%&'*+\-.^_`|~0-9a-zA-Z]+$/.test(name.trim())

const validateHeaders = (newHeaders) => {
	return (
		typeof newHeaders === "object" &&
		newHeaders !== null &&
		Object.keys(newHeaders).every(
			(key) =>
				(typeof key === "string" &&
					isValidHeaderName(key) &&
					typeof newHeaders[key] === "string") ||
				Array.isArray(newHeaders[key]),
		)
	)
}

// Based on https://github.com/axios/axios/blob/90864b3a3fb52ede567f7dd70b055f1f45c162ef/lib/core/AxiosHeaders.js#L54
const formatHeader = (header) => {
	return header
		.trim() // Remove leading and trailing whitespaces
		.toLowerCase() // Convert the string to lowercase
		.replace(/([a-z\d])(\w*)/g, (w, char, str) => {
			return char.toUpperCase() + str
		})
}

// Based on https://github.com/axios/axios/blob/90864b3a3fb52ede567f7dd70b055f1f45c162ef/lib/core/AxiosHeaders.js#L12
const formatValue = (value) => {
	if (value === false || value == null) {
		return value
	}

	return Array.isArray(value) ? value.map(formatValue) : String(value)
}

export const processHeaders = (headers) => {
	return Object.fromEntries(
		Object.entries(headers).map(([key, value]) => [formatHeader(key), formatValue(value)]),
	)
}

export const setHeaders = (target, newHeaders) => {
	if (validateHeaders(newHeaders)) {
		// Perform additional processing before updating
		const processedHeaders = processHeaders(newHeaders)

		// Update headers
		Object.assign(target, { ...processedHeaders })
	} else {
		throw new TypeError("Invalid headers. Please provide valid headers.")
	}
}

const requestOptionsRegistry = {
	method: true,
	headers: true,
	body: true,
	mode: true,
	credentials: true,
	cache: true,
	redirect: true,
	referrer: true,
	referrerPolicy: true,
	integrity: true,
	keepalive: true,
	signal: true,
	window: true,
	dispatcher: true,
	duplex: true,
}

export const filterRequestOptions = (requestOptions) => {
	const filteredOptions = {}

	for (const [key, value] of Object.entries(requestOptions)) {
		if (requestOptionsRegistry[key]) {
			filteredOptions[key] = value
		}
	}

	return filteredOptions
}

export const mergeConfigs = (config: Options, methodConfig: MethodConfig, method: HttpMethod) => {
	const base_uri = new URL(methodConfig.path, config?.url ?? undefined)
	const abortController = new AbortController()
	let headersConfig = new Headers({
		...config?.headers,
	})

	if (methodConfig.headers) {
		headersConfig = mergeHeaders(headersConfig, methodConfig.headers)
	}

	// https://felixgerschau.com/js-manipulate-url-search-params/
	// Add queries to the url
	methodConfig?.qs ? (base_uri.search = qs.stringify(methodConfig.qs, config?.qs)) : null
	delete methodConfig.qs
	delete methodConfig.path

	// timeout
	config.timeout = methodConfig.timeout ?? config.timeout ?? 10000

	if (methodConfig.signal) {
		if (!(methodConfig.signal instanceof AbortSignal))
			throw new TypeError(
				typeof methodConfig.signal + " received for signal, but expected an AbortSignal",
			)

		const originalSignal = methodConfig.signal

		methodConfig.signal.addEventListener("abort", () => {
			abortController!.abort(originalSignal.reason)
		})
	}

	methodConfig.signal = abortController.signal

	return {
		...config,
		...methodConfig,
		method: method.toLocaleUpperCase(),
		url: base_uri,
		headers: headersConfig,
		timeout: methodConfig.timeout || config.timeout,
		signal: methodConfig.signal,
		abortController,
	}
}
