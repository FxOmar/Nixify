interface Options {
    PREFIX_URL?: {
        [name: string]: string;
    } | string;
    headers?: {
        [key: string]: string;
    };
    hooks?: {
        beforeRequest: (request: Request) => void;
    };
}
interface Thenable<U> extends ResponseHandlers<U> {
    then<TResult1 = ResponseHandlers<U>, TResult2 = never>(callback: (value: ResponseInterface<U>) => TResult1 | PromiseLike<TResult1>): Promise<TResult1 | TResult2>;
}
declare type RequestMethodsType = <U = any>(path: string, options?: MethodConfig) => Thenable<U>;
interface RequestMethods {
    get: RequestMethodsType;
    head: RequestMethodsType;
    put: RequestMethodsType;
    delete: RequestMethodsType;
    post: RequestMethodsType;
    patch: RequestMethodsType;
    options: RequestMethodsType;
    setHeaders: (newHeaders: {
        [key: string]: string;
    }) => void;
}
interface ResponseInterface<T> {
    data: T;
    headers: {
        [key: string]: string;
    };
    status: number;
    statusText: string;
    config: Request;
}
interface ResponseHandlers<T> {
    json: () => ResponseInterface<T>;
    text: () => ResponseInterface<string>;
    blob: () => ResponseInterface<Blob>;
    arrayBuffer: () => ResponseInterface<ArrayBuffer>;
    formData: () => ResponseInterface<FormData>;
}
interface MethodConfig {
    path?: string;
    PREFIX_URL?: string;
    qs?: {
        [name: string]: queryType | number;
    };
    method?: string;
    body?: FormData | URLSearchParams | Blob | BufferSource | ReadableStream;
    json?: object;
    headers?: {
        [name: string]: string;
    };
    responseType?: string;
    signal?: AbortSignal;
    hooks?: {
        beforeRequest: (request: Request) => void;
    };
}
declare type queryType = string | URLSearchParams | Record<string, string> | string[][];

declare const _default: {
    get: RequestMethodsType;
    head: RequestMethodsType;
    put: RequestMethodsType;
    delete: RequestMethodsType;
    post: RequestMethodsType;
    patch: RequestMethodsType;
    options: RequestMethodsType;
    setHeaders: (newHeaders: {
        [key: string]: string;
    }) => void;
    create: (config?: Options) => RequestMethods;
};

export { _default as default };
