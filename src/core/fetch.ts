import timeout from "../utils/timeout"

const _fetch = async (request: Request, config) => {
	if (config?.hooks?.beforeRequest) {
		await config.hooks.beforeRequest(request)
	}

	if (config.timeout === false) {
		return fetch(request.clone())
	}

	return timeout(request.clone(), config.abortController, config.timeout)
}

export default _fetch
