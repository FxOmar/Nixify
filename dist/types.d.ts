interface OptionsInterface {
    PREFIX_URL?: {
        [name: string]: string;
    } | string;
}
interface ResponseInterface<T> {
    data: T;
    headers: any;
    status: number;
    statusText: string;
    config: Request;
}
type MethodsType = <U>(path: string, options?: MethodConfigInterface) => Promise<ResponseInterface<U>>;
interface MethodsInterface {
    get: MethodsType;
    head: MethodsType;
    put: MethodsType;
    delete: MethodsType;
    post: MethodsType;
    patch: MethodsType;
    options: MethodsType;
}
interface MethodConfigInterface {
    PREFIX_URL?: string;
    body?: FormData | URLSearchParams | Blob | BufferSource | ReadableStream;
    json?: JSON;
    headers?: Headers;
    responseType?: string;
    signal: AbortSignal;
}
/**
 * Create new instance for the given configuration.
 *
 * @param {OptionsInterface} config - PREFIX_URL { API: string: URI: string}
 *
 * @returns {MethodsInterface} - new instance of BHR
 */
export function createNewInstance(config?: OptionsInterface): MethodsInterface;
declare const http: MethodsInterface;
export default http;

//# sourceMappingURL=types.d.ts.map
