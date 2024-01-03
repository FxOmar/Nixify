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
