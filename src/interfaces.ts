export interface Options {
  PREFIX_URL?: { [name: string]: string } | string;
}

export interface ResponseInterface<T> {
  data: T;
  headers: unknown;
  status: number;
  statusText: string;
  config: Request;
}

type SetTypeMethod = <U>() => ResponseInterface<U>;

export interface SetTypes {
  json: SetTypeMethod;
  text: SetTypeMethod;
  blob: SetTypeMethod;
  arrayBuffer: SetTypeMethod;
  formData: SetTypeMethod;
}

interface Thenable<U> extends SetTypes {
  then<TResult1 = SetTypes, TResult2 = never>(
    callback: (value: ResponseInterface<U>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1 | TResult2>;
}

export type CreateNewInstance = {
  create: (config?: Options) => RequestMethods;
};

export type RequestMethodsType = <U>(
  path: string,
  options?: MethodConfig
) => Thenable<U>;

export interface RequestMethods {
  get: RequestMethodsType;
  head: RequestMethodsType;
  put: RequestMethodsType;
  delete: RequestMethodsType;
  post: RequestMethodsType;
  patch: RequestMethodsType;
  options: RequestMethodsType;
}

export interface MethodConfig {
  PREFIX_URL?: string;
  path: string;
  method: string;
  body?: FormData | URLSearchParams | Blob | BufferSource | ReadableStream;
  json?: JSON;
  headers?: Headers;
  responseType?: string;
  signal?: AbortSignal;
}