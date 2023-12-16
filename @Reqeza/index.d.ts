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
declare type SetTypeMethod<R> = () => ResponseInterface<R>;
interface SetTypes<R> {
    json: SetTypeMethod<R>;
    text: SetTypeMethod<R>;
    blob: SetTypeMethod<R>;
    arrayBuffer: SetTypeMethod<R>;
    formData: SetTypeMethod<R>;
}
interface Thenable<U> extends SetTypes<U> {
    then<TResult1 = SetTypes<U>, TResult2 = never>(callback: (value: ResponseInterface<U>) => TResult1 | PromiseLike<TResult1>): Promise<TResult1 | TResult2>;
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
    path?: string;
    PREFIX_URL?: string;
    qs?: {
        [name: string]: queryType | number;
    };
    method?: string;
    body?: FormData | URLSearchParams | Blob | BufferSource | ReadableStream;
    json?: JSON;
    headers?: {
        [name: string]: string;
    };
    responseType?: string;
    signal?: AbortSignal;
}
declare type queryType = string | URLSearchParams | Record<string, string> | string[][];

declare const _default: CreateNewInstance & RequestMethods;

export { _default as default };
