interface OptionsInterface {
    PREFIX_URL?: {
        [name: string]: string;
    } | string;
}
interface ResponseInterface {
    data: Record<string, unknown>;
    headers: any;
    status: number;
    statusText: string;
    config: Request;
}
type methodsType = (path: string, options?: MethodConfigInterface) => Promise<ResponseInterface>;
interface methodsInterface {
    get: methodsType;
    head: methodsType;
    put: methodsType;
    delete: methodsType;
    post: methodsType;
    patch: methodsType;
    options: methodsType;
}
interface MethodConfigInterface {
    PREFIX_URL?: string;
    body?: FormData | URLSearchParams;
    json?: JSON;
    headers?: Headers;
    responseType?: string;
}
/**
 * Create new instance for the given configuration.
 *
 * @param {OptionsInterface} config - PREFIX_URL { API: string: URI: string}
 *
 * @returns {methodsInterface} - new instance of BHR
 */
export function createNewInstance(config?: OptionsInterface): methodsInterface;
declare const http: methodsInterface;
export default http;

//# sourceMappingURL=types.d.ts.map
