type HttpMethod = "get" | "head" | "put" | "delete" | "post" | "patch" | "options";
type ResponseType = "json" | "text" | "blob" | "arrayBuffer" | "formData";
type ResponseTypes = {
    json: "application/json";
    text: "text/*";
    formData: "multipart/form-data";
    arrayBuffer: "*/*";
    blob: "*/*";
};
type XOR<T, U> = T | U extends object ? (T & Record<string, never>) | (U & Record<string, never>) : T | U;
type RequestDelayFunction = (attempt: number, response: Response | null) => number;
type RequestRetryOnFunction = (attempt: number, response: Response | null) => boolean | Promise<boolean>;
interface RequestInitRetryParams {
    retries?: number | boolean;
    retryDelay?: number | RequestDelayFunction;
    retryOn?: number[] | RequestRetryOnFunction;
}
interface Options {
    url: string;
    headers?: {
        [key: string]: string;
    };
    hooks?: {
        beforeRequest: (request: Request) => void;
        afterResponse: (request: Request, response: Response, config: any) => void;
        beforeRetry: (request: Request, response: Response, attempt: number, delay: number) => void;
    };
    qs?: StringifyOptions;
    timeout?: number | false;
    retryConfig?: RequestInitRetryParams;
}
interface MethodConfig extends Omit<RequestInit, "method"> {
    path?: string;
    qs?: {
        [name: string]: queryType | number;
    };
    json?: object;
    responseType?: ResponseType;
    timeout?: number | false;
    retry?: RequestInitRetryParams;
    params?: {
        [key: string]: string | number;
    };
}
type ServiceConfig = {
    [key: string]: Options;
};
type RequestMethodsType = <U = any>(path: string, options?: MethodConfig) => XOR<ResponseHandlers<U>, Promise<ResponseInterface<U>>>;
interface ResponseHandlers<T> {
    json: () => Promise<ResponseInterface<T>>;
    text: () => Promise<ResponseInterface<string>>;
    blob: () => Promise<ResponseInterface<Blob>>;
    arrayBuffer: () => Promise<ResponseInterface<ArrayBuffer>>;
    formData: () => Promise<ResponseInterface<FormData>>;
}
interface RequestMethods {
    get: RequestMethodsType;
    head: RequestMethodsType;
    put: RequestMethodsType;
    delete: RequestMethodsType;
    post: RequestMethodsType;
    patch: RequestMethodsType;
    options: RequestMethodsType;
    beforeRequest: (fn: (request: Request) => void) => void;
    afterResponse: (fn: (request: Request, response: Response, config: any) => void) => void;
    beforeRetry: (fn: (request: Request, response: Response, attempt: number, delay: number) => void) => void;
    setHeaders: (newHeaders: {
        [key: string]: string;
    }) => void;
}
type ServiceReqMethods<T extends ServiceConfig> = {
    [K in keyof T]: RequestMethods;
};
interface ResponseInterface<T> {
    data: T;
    headers: Headers;
    status: number;
    statusText: string;
    config: Request;
}
type queryType = string | URLSearchParams | Record<string, string> | string[][];
interface NormalizedOptions extends RequestInit, Omit<Options, "headers"> {
    method: NonNullable<RequestInit["method"]>;
    credentials: NonNullable<RequestInit["credentials"]>;
}
type StringifyOptions = {
    readonly strict?: boolean;
    readonly encode?: boolean;
    readonly arrayFormat?: "bracket" | "index" | "comma" | "separator" | "bracket-separator" | "colon-list-separator" | "none";
    readonly arrayFormatSeparator?: string;
    readonly sort?: ((itemLeft: string, itemRight: string) => number) | false;
    readonly skipNull?: boolean;
    readonly skipEmptyString?: boolean;
};
/**
Stringify an object into a query string and sort the keys.
*/
type Stringify = (object: Record<string, any>, options?: StringifyOptions) => string;
type CombinedRequestInit = RequestInit;
type RequestInitRegistry = {
    [K in keyof CombinedRequestInit]-?: true;
};

export type { HttpMethod, MethodConfig, NormalizedOptions, Options, RequestInitRegistry, RequestInitRetryParams, RequestMethods, RequestMethodsType, ResponseHandlers, ResponseInterface, ResponseType, ResponseTypes, ServiceConfig, ServiceReqMethods, Stringify, XOR, queryType };
