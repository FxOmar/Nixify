export interface Options {
  PREFIX_URL?: { [name: string]: string } | string;
  headers?: { [key: string]: string };
  hooks?: { beforeRequest: (request: Request) => void };
}

export type CreateNewInstance = {
  create: (config?: Options) => RequestMethods;
};

interface Thenable<U> extends ResponseHandlers<U> {
  then<TResult1 = ResponseHandlers<U>, TResult2 = never>(
    callback: (value: ResponseInterface<U>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1 | TResult2>;
}

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setHeaders: (newHeaders: any) => void;
}

export interface ResponseInterface<T> {
  data: T;
  headers: { [key: string]: string };
  status: number;
  statusText: string;
  config: Request;
}
export interface ResponseHandlers<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: () => ResponseInterface<T | any>;
  text: () => ResponseInterface<string>;
  blob: () => ResponseInterface<Blob>;
  arrayBuffer: () => ResponseInterface<ArrayBuffer>;
  formData: () => ResponseInterface<FormData>;
}

export interface MethodConfig {
  path?: string;
  PREFIX_URL?: string;
  qs?: { [name: string]: queryType | number }; // Object of queries.
  method?: string;
  body?: FormData | URLSearchParams | Blob | BufferSource | ReadableStream;
  json?: object;
  headers?: { [name: string]: string };
  responseType?: string;
  signal?: AbortSignal;
  hooks?: { beforeRequest: (request: Request) => void };
}

export type queryType =
  | string
  | URLSearchParams
  | Record<string, string>
  | string[][];
