export { HTTPError, ResponseError } from "./errors"

export { qs } from "./qs"

export function isEmpty(target) {
	return target === null || target === undefined || Object.keys(target).length === 0
}

export function has(target: object, key: string): boolean {
	return isEmpty(target) ? false : Object.hasOwnProperty.call(target, key)
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

export const setHeaders = (target, newHeaders) => {
	Object.assign(target, { ...newHeaders })
}
