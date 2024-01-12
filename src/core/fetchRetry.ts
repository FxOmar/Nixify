import _fetch from "./fetch"
import json from "../utils/json-parse"
import { RequestInitRetryParams } from "../types"

/**
 * Based on https://github.com/jonbern/fetch-retry/blob/master/index.js
 */
const fetchRetry = async (request: Request, config): Promise<Response> => {
	const { retries, retryDelay, retryOn } = config.retryConfig as RequestInitRetryParams

	delete config.abortController

	return new Promise((resolve, reject) => {
		const retry = async (attempt: number, response: Response) => {
			response.json = async () => json.parse(await response.clone().text())

			const delay =
				typeof retryDelay === "function" ? retryDelay(attempt, response) : retryDelay

			// beforeRetry hook
			if (config?.hooks?.beforeRetry) {
				await config.hooks.beforeRetry(request, response, attempt, delay)
			}

			setTimeout(() => wrappedFetch(++attempt), delay)
		}

		const wrappedFetch = async (attempt) => {
			try {
				const response = await _fetch(request, config)

				// afterResponse hook
				if (config?.hooks?.afterResponse) {
					response.json = async () => json.parse(await response.clone().text())
					await config.hooks.afterResponse(request, response, config)
				}

				const shouldRetry = () => {
					if (Array.isArray(retryOn) && retryOn.indexOf(response.status) === -1) {
						resolve(response)
					} else if (typeof retryOn === "function") {
						try {
							response.json = async () => json.parse(await response.clone().text())
							Promise.resolve(retryOn(attempt, response))
								.then((retryOnResponse) => {
									retryOnResponse ? retry(attempt, response) : resolve(response)
								})
								.catch(reject)
						} catch (error) {
							reject(error)
						}
					} else {
						attempt < retries ? retry(attempt, response) : resolve(response)
					}
				}

				shouldRetry()
			} catch (error) {
				reject(error)
			}
		}

		wrappedFetch(0)
	})
}

export default fetchRetry
