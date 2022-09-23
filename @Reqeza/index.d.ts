interface Options {
    PREFIX_URL?: {
        [name: string]: string;
    } | string;
}
interface ResponseInterface<T> {
    data: T;
    headers: unknown;
    status: number;
    statusText: string;
    config: Request;
}
declare type SetTypeMethod = <U>() => ResponseInterface<U>;
interface SetTypes {
    json: SetTypeMethod;
    text: SetTypeMethod;
    blob: SetTypeMethod;
    arrayBuffer: SetTypeMethod;
    formData: SetTypeMethod;
}
interface Thenable<U> extends SetTypes {
    then<TResult1 = SetTypes, TResult2 = never>(callback: (value: ResponseInterface<U>) => TResult1 | PromiseLike<TResult1>): Promise<TResult1 | TResult2>;
}
declare type CreateNewInstance = {
    create: (config?: Options) => RequestMethods;
};
declare type RequestMethodsType = <U>(path: string, options?: MethodConfig) => Thenable<U>;
interface RequestMethods {
    get: RequestMethodsType;
    head: RequestMethodsType;
    put: RequestMethodsType;
    delete: RequestMethodsType;
    post: RequestMethodsType;
    patch: RequestMethodsType;
    options: RequestMethodsType;
}
interface MethodConfig {
    PREFIX_URL?: string;
    path: string;
    method: string;
    body?: FormData | URLSearchParams | Blob | BufferSource | ReadableStream;
    json?: JSON;
    headers?: Headers;
    responseType?: string;
    signal?: AbortSignal;
}

declare const _default: CreateNewInstance & RequestMethods;

export { _default as default };
