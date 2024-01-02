/**
 * https://github.com/sindresorhus/query-string/blob/main/base.js
 */
import { Stringify } from "../interfaces"

const isNullOrUndefined = (value) => value === null || value === undefined

const strictUriEncode = (string) =>
	encodeURIComponent(string).replace(
		/[!'()*]/g,
		(x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`,
	)

function validateArrayFormatSeparator(value) {
	if (typeof value !== "string" || value.length !== 1) {
		throw new TypeError("arrayFormatSeparator must be single character string")
	}
}

export function encode(value, options) {
	if (options.encode) {
		return options.strict ? strictUriEncode(value) : encodeURIComponent(value)
	}

	return value
}

function encoderForArrayFormat(options) {
	switch (options.arrayFormat) {
		case "index": {
			return (key) => (result, value) => {
				const index = result.length

				if (
					value === undefined ||
					(options.skipNull && value === null) ||
					(options.skipEmptyString && value === "")
				) {
					return result
				}

				if (value === null) {
					return [...result, [encode(key, options), "[", index, "]"].join("")]
				}

				return [
					...result,
					[
						encode(key, options),
						"[",
						encode(index, options),
						"]=",
						encode(value, options),
					].join(""),
				]
			}
		}

		case "bracket": {
			return (key) => (result, value) => {
				if (
					value === undefined ||
					(options.skipNull && value === null) ||
					(options.skipEmptyString && value === "")
				) {
					return result
				}

				if (value === null) {
					return [...result, [encode(key, options), "[]"].join("")]
				}

				return [...result, [encode(key, options), "[]=", encode(value, options)].join("")]
			}
		}

		case "colon-list-separator": {
			return (key) => (result, value) => {
				if (
					value === undefined ||
					(options.skipNull && value === null) ||
					(options.skipEmptyString && value === "")
				) {
					return result
				}

				if (value === null) {
					return [...result, [encode(key, options), ":list="].join("")]
				}

				return [
					...result,
					[encode(key, options), ":list=", encode(value, options)].join(""),
				]
			}
		}

		case "comma":
		case "separator":
		case "bracket-separator": {
			const keyValueSep = options.arrayFormat === "bracket-separator" ? "[]=" : "="

			return (key) => (result, value) => {
				if (
					value === undefined ||
					(options.skipNull && value === null) ||
					(options.skipEmptyString && value === "")
				) {
					return result
				}

				// Translate null to an empty string so that it doesn't serialize as 'null'
				value = value === null ? "" : value

				if (result.length === 0) {
					return [[encode(key, options), keyValueSep, encode(value, options)].join("")]
				}

				return [[result, encode(value, options)].join(options.arrayFormatSeparator)]
			}
		}

		default: {
			return (key) => (result, value) => {
				if (
					value === undefined ||
					(options.skipNull && value === null) ||
					(options.skipEmptyString && value === "")
				) {
					return result
				}

				if (value === null) {
					return [...result, encode(key, options)]
				}

				return [...result, [encode(key, options), "=", encode(value, options)].join("")]
			}
		}
	}
}

const stringify: Stringify = (object, options?) => {
	if (!object) {
		return ""
	}

	options = {
		encode: true,
		strict: true,
		arrayFormat: "none",
		arrayFormatSeparator: ",",
		...options,
	}

	validateArrayFormatSeparator(options.arrayFormatSeparator)

	const shouldFilter = (key) =>
		(options.skipNull && isNullOrUndefined(object[key])) ||
		(options.skipEmptyString && object[key] === "")

	const formatter = encoderForArrayFormat(options)

	const objectCopy = {}

	for (const [key, value] of Object.entries(object)) {
		if (!shouldFilter(key)) {
			objectCopy[key] = value
		}
	}

	const keys = Object.keys(objectCopy)

	if (options.sort !== false) {
		keys.sort(options.sort)
	}

	return keys
		.map((key) => {
			const value = object[key]

			if (value === undefined) {
				return ""
			}

			if (value === null) {
				return encode(key, options)
			}

			if (Array.isArray(value)) {
				if (value.length === 0 && options.arrayFormat === "bracket-separator") {
					return encode(key, options) + "[]"
				}

				return value.reduce(formatter(key), []).join("&")
			}

			return encode(key, options) + "=" + encode(value, options)
		})
		.filter((x) => x.length > 0)
		.join("&")
}

export const qs = { stringify }
