/**
 * Based on https://github.com/hapijs/bourne/blob/master/lib/index.js
 *
 * All the credits goes to the hapijs/bourne project contributors
 */
const hasTextDecoder = typeof TextDecoder !== "undefined"
const textDecoder = new TextDecoder("utf-8")
const suspectRx =
	/"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/

interface Reviver {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(this: any, key: string, value: any): any
}

const parse = (text, protoAction: "remove" | "error" = "remove", reviver?: Reviver) => {
	if (hasTextDecoder && (text instanceof Uint8Array || text instanceof ArrayBuffer)) {
		// Convert binary data to a string
		text = textDecoder.decode(text)
	}

	// https://github.com/fastify/secure-json-parse/blob/aba5d33118a09fe482f35c3a8b8264e30b157b0f/index.js#L21
	// BOM checker
	if (text && text.charCodeAt(0) === 0xfeff) {
		text = text.slice(1)
	}

	// Parse normally, allowing exceptions
	const obj = JSON.parse(text, reviver)

	// Ignore null and non-objects
	if (!obj || typeof obj !== "object") {
		return obj
	}

	// Check original string for potential exploit
	if (!text.match(suspectRx)) {
		return obj
	}

	// Scan result for proto keys
	scan(obj, protoAction)

	return obj
}

const scan = (obj, protoAction: "remove" | "error") => {
	let next = [obj]

	while (next.length) {
		const nodes = next
		next = []

		for (const node of nodes) {
			if (Object.prototype.hasOwnProperty.call(node, "__proto__")) {
				// Avoid calling node.hasOwnProperty directly
				if (protoAction === "error") {
					throw new SyntaxError("Object contains forbidden prototype property")
				}

				delete node.__proto__
			}

			for (const key in node) {
				const value = node[key]
				if (value && typeof value === "object") {
					next.push(node[key])
				}
			}
		}
	}
}

export default { parse }
