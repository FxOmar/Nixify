class $bc16dbbb7ff0bf25$var$BHR {
    constructor(__options = {
    }, methodsConfig){
        this.__options = __options;
        this.__methodsConfig = methodsConfig;
    }
    /**
   * TODO: This Block of code need to be refactored it may cause us a problem in the future.
   */ get __parseURL() {
        try {
            return new URL(!this.__options.hasOwnProperty("prefixUrl") ? this.__methodsConfig.path : (typeof this.__options.prefixUrl === "object" && this.__options.prefixUrl !== null ? this.__methodsConfig.prefixUrl ? this.__options.prefixUrl[this.__methodsConfig.prefixUrl] : Object.values(this.__options.prefixUrl)[0] : this.__options.prefixUrl ?? this.__methodsConfig.prefixUrl) + this.__methodsConfig.path);
        } catch (error) {
            throw new TypeError(error);
        }
    }
    get __configuration() {
        const headersConfig = {
            ...this.__methodsConfig.headers
        };
        return new Request(this.__parseURL.href, {
            method: this.__methodsConfig.method.toLocaleUpperCase(),
            headers: new Headers(headersConfig)
        });
    }
    HttpRequest() {
        const response = new Response();
        if (this.__methodsConfig.responseType in response) return fetch(this.__configuration).then(async (res)=>{
            const retrieveHeaders = (headers = {
            })=>{
                for (let pair of res.headers.entries())headers[pair[0]] = pair[1];
                return headers;
            };
            return {
                data: await res.json(),
                headers: retrieveHeaders(),
                status: res.status,
                statusText: res.statusText,
                config: {
                    ...this.__options,
                    ...this.__methodsConfig
                }
            };
        });
        throw new Error("Response type not supported");
    }
}
function $bc16dbbb7ff0bf25$export$aa221cf8b095b4a8(config) {
    const methods = [
        "get",
        "post",
        "patch"
    ];
    const instance = {
    };
    for(let index = 0; index <= methods.length - 1; index++){
        const method = methods[index];
        instance[method] = (path, options)=>{
            return new $bc16dbbb7ff0bf25$var$BHR(config, {
                method: method,
                path: path,
                ...options
            }).HttpRequest();
        };
    }
    return instance;
}
const $bc16dbbb7ff0bf25$var$http = $bc16dbbb7ff0bf25$export$aa221cf8b095b4a8();
var $bc16dbbb7ff0bf25$export$2e2bcd8739ae039 = $bc16dbbb7ff0bf25$var$http;


export {$bc16dbbb7ff0bf25$export$aa221cf8b095b4a8 as createNewInstance, $bc16dbbb7ff0bf25$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.js.map
