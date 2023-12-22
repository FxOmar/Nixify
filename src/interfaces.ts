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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequestMethodsType = <U = any>(
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
  setHeaders: (newHeaders: { [key: string]: string }) => void;
}

export interface ResponseInterface<T> {
  data: T;
  headers: { [key: string]: string };
  status: number;
  statusText: string;
  config: Request;
}
export interface ResponseHandlers<T> {
  json: () => ResponseInterface<T>;
  text: () => ResponseInterface<string>;
  blob: () => ResponseInterface<Blob>;
  arrayBuffer: () => ResponseInterface<ArrayBuffer>;
  formData: () => ResponseInterface<FormData>;
}

export interface MethodConfig extends Omit<RequestInit, "method"> {
  path?: string;
  PREFIX_URL?: string;
  qs?: { [name: string]: queryType | number }; // Object of queries.
  body?: FormData | URLSearchParams | Blob | BufferSource | ReadableStream;
  json?: object;
  responseType?: string;
  hooks?: { beforeRequest: (request: Request) => void };
}

export type queryType =
  | string
  | URLSearchParams
  | Record<string, string>
  | string[][];

export interface NormalizedOptions extends RequestInit {
  // eslint-disable-line @typescript-eslint/consistent-type-definitions
  // Extended from `RequestInit`, but ensured to be set (not optional).
  method: NonNullable<RequestInit["method"]>;
  credentials: NonNullable<RequestInit["credentials"]>;

  // Extended from custom `KyOptions`, but ensured to be set (not optional).
  // retry: RetryOptions;
  PREFIX_URL: string;
}
