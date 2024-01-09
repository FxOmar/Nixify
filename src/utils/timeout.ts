/**
 * Based on https://github.com/sindresorhus/ky/blob/main/source/utils/timeout.ts
 */
import { TimeoutError } from "./errors"

export default (
	request: Request,
	abortController: AbortController | undefined,
	timeout,
): Promise<Response> => {
	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			if (abortController) {
				abortController.abort()
			}

			reject(new TimeoutError(request))
		}, timeout)

		// https://typescript.tv/new-features/the-void-operator-in-typescript-and-javascript/#promises-with-side-effects
		void fetch(request)
			.then(resolve)
			.catch(reject)
			.finally(() => {
				clearTimeout(timeoutId)
			})
	})
}
