class $a8e101027d325e52$var$BHR {
    constructor(__options = {
    }, __methodsConfig){
        this.__options = __options;
        this.__methodsConfig = __methodsConfig;
        this.__options = __options;
        this.__methodsConfig = __methodsConfig;
    }
    /**
   * TODO: This Block of code need to be refactored it may cause us a problem in the future.
   *
   * Parse the given URI
   */ get __parseURI() {
        try {
            return new URL(!Object.hasOwnProperty.call(this.__options, "PREFIX_URL") ? this.__methodsConfig.path : (typeof this.__options.PREFIX_URL === "object" && this.__options.PREFIX_URL !== null ? this.__methodsConfig.PREFIX_URL ? this.__options.PREFIX_URL[this.__methodsConfig.PREFIX_URL] : Object.values(this.__options.PREFIX_URL)[0] : this.__options.PREFIX_URL ?? this.__methodsConfig.PREFIX_URL) + this.__methodsConfig.path);
        } catch (error) {
            throw new TypeError(error);
        }
    }
    get __configuration() {
        const headersConfig = new Headers(this.__methodsConfig.headers);
        /**
     * if body is json, then set headers to content-type JSON
     */ if ([
            "post",
            "put",
            "patch"
        ].includes(this.__methodsConfig.method) && Object.hasOwnProperty.call(this.__methodsConfig, "json") && !Object.hasOwnProperty.call(this.__methodsConfig, "headers['Content-Type']")) headersConfig.append("Content-Type", "application/json; charset=UTF-8");
        return new Request(this.__parseURI.href, {
            method: this.__methodsConfig.method.toLocaleUpperCase(),
            headers: headersConfig,
            /*
       * Note: The body type can only be a Blob, BufferSource, FormData, URLSearchParams,
       * USVString or ReadableStream type,
       * so for adding a JSON object to the payload you need to stringify that object.
       */ body: Object.hasOwnProperty.call(this.__methodsConfig, "json") ? JSON.stringify(this.__methodsConfig.json) : this.__methodsConfig.body,
            // Cancel request
            signal: this.__methodsConfig.signal
        });
    }
    /**
   * HttpAdapter for making http requests 🦅 to the given API'S.
   *
   * @returns {Promise<ResponseInterface>}
   */ httpAdapter() {
        const response1 = new Response();
        this.__methodsConfig.responseType === undefined && (this.__methodsConfig.responseType = "json");
        if (this.__methodsConfig.responseType in response1) {
            const requestConfig = this.__configuration;
            return fetch(requestConfig).then(async (res)=>{
                /**
         * Retrieve response Header.
         *
         * @param headers
         * @returns Response Headers
         */ const retrieveHeaders = (headers = {
                })=>{
                    for (const pair of res.headers.entries())headers[pair[0]] = pair[1];
                    return headers;
                };
                // Response Schema
                const response = {
                    data: await res.json(),
                    headers: retrieveHeaders(),
                    status: res.status,
                    statusText: res.statusText,
                    config: requestConfig
                };
                return response;
            });
        }
        throw new Error("Response type not supported");
    }
}
function $a8e101027d325e52$export$aa221cf8b095b4a8(config) {
    const methods = [
        "get",
        "head",
        "put",
        "delete",
        "post",
        "patch",
        "options"
    ]; // All the HTTP request methods.
    /**
   * Build methods shortcut *Http.get()*.
   */ const methodsBuilder = methods.map((Method)=>({
            [Method]: (path, options)=>{
                return new $a8e101027d325e52$var$BHR(config, {
                    method: Method,
                    path: path,
                    ...options
                }).httpAdapter();
            }
        })
    );
    return Object.assign({
    }, ...methodsBuilder);
}
const $a8e101027d325e52$var$http = $a8e101027d325e52$export$aa221cf8b095b4a8();
var $a8e101027d325e52$export$2e2bcd8739ae039 = $a8e101027d325e52$var$http;


export {$a8e101027d325e52$export$aa221cf8b095b4a8 as createNewInstance, $a8e101027d325e52$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=bhr.mjs.map