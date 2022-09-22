import { ValidationError, ResponseError } from "./utils/errors";

// TODO: Move all interfaces to a separate file.
interface OptionsInterface {
  PREFIX_URL?: { [name: string]: string } | string;
}

interface ResponseInterface<T> {
  data: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers: unknown;
  status: number;
  statusText: string;
  config: Request;
}

type SetTypeMethod = () => unknown;

interface SetTypesInterface<U> {
  json: SetTypeMethod;
  text: SetTypeMethod;
  blob: SetTypeMethod;
  arrayBuffer: SetTypeMethod;
  formData: SetTypeMethod;

  then(callback: unknown): Promise<ResponseInterface<U>>;
}

type MethodsType = <U>(
  path: string,
  options?: MethodConfigInterface
) => Promise<ResponseInterface<U>>;

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
  path: string;
  method: string;
  body?: FormData | URLSearchParams | Blob | BufferSource | ReadableStream;
  json?: JSON;
  headers?: Headers;
  responseType?: string;
  signal?: AbortSignal;
}

// All the HTTP request methods.
const METHODS = ["get", "head", "put", "delete", "post", "patch", "options"];
// Response types
const TYPES_METHODS = ["json", "text", "blob", "arrayBuffer", "formData"];

class Http {
  constructor(
    protected __options: OptionsInterface = {},
    protected __methodsConfig: MethodConfigInterface
  ) {
    this.__options = __options;
    this.__methodsConfig = __methodsConfig;
  }

  /**
   * TODO: This Block of code need to be refactored it may cause us a problem in the future.
   *
   * Parse the given URI
   */
  protected get __parseURI(): URL {
    try {
      return new URL(
        !Object.hasOwnProperty.call(this.__options, "PREFIX_URL")
          ? this.__methodsConfig.path
          : (typeof this.__options.PREFIX_URL === "object" &&
            this.__options.PREFIX_URL !== null
              ? this.__methodsConfig.PREFIX_URL
                ? this.__options.PREFIX_URL[this.__methodsConfig.PREFIX_URL]
                : Object.values(this.__options.PREFIX_URL)[0]
              : this.__options.PREFIX_URL ?? this.__methodsConfig.PREFIX_URL) +
            this.__methodsConfig.path
      );
    } catch (error) {
      throw new ValidationError("The given URI is invalid.");
    }
  }

  protected get __configuration(): Request {
    const headersConfig = new Headers(this.__methodsConfig.headers);

    /**
     * if body is json, then set headers to content-type JSON
     */
    if (
      ["post", "put", "patch"].includes(this.__methodsConfig.method) &&
      Object.hasOwnProperty.call(this.__methodsConfig, "json") &&
      !Object.hasOwnProperty.call(
        this.__methodsConfig,
        "headers['Content-Type']"
      )
    ) {
      headersConfig.append("Content-Type", "application/json; charset=UTF-8");
    }

    return new Request(this.__parseURI.href, {
      method: this.__methodsConfig.method.toLocaleUpperCase(),
      headers: headersConfig,
      /*
       * Note: The body type can only be a Blob, BufferSource, FormData, URLSearchParams,
       * USVString or ReadableStream type,
       * so for adding a JSON object to the payload you need to stringify that object.
       */
      body: Object.hasOwnProperty.call(this.__methodsConfig, "json")
        ? JSON.stringify(this.__methodsConfig.json)
        : this.__methodsConfig.body, // body data type must match "Content-Type" header

      // Cancel request
      signal: this.__methodsConfig.signal,
    });
  }
  /**
   * HttpAdapter for making http requests 🦅 to the given API'S.
   *
   * @returns {Promise<ResponseInterface>}
   */
  httpAdapter<R>() {
    const requestConfig = this.__configuration;

    return fetch(requestConfig)
      .then(ResponseError)
      .then(async (res) => {
        /**
         * Retrieve response Header.
         *
         * @param headers
         * @returns Response Headers
         */
        const retrieveHeaders = () => {
          const headers = {};
          for (const pair of res.headers.entries()) {
            headers[pair[0]] = pair[1];
          }

          return headers;
        };

        const parseResponse = () => res[this.__methodsConfig.responseType]();

        // Response Schema
        const response: ResponseInterface<R> = {
          data: await parseResponse(),
          headers: retrieveHeaders(),
          status: res.status,
          statusText: res.statusText,
          config: requestConfig,
        };

        return response;
      });
  }
}

const Reqeza = {
  /**
   * Create new instance for the given configuration.
   *
   * @param {OptionsInterface} config - PREFIX_URL { API: string: URI: string}
   *
   * @returns {MethodsInterface} - new instance of Http
   *
   * @example
   * const http = Reqeza.create({
   *  PREFIX_URL: {
   *    API: "https://api.github.com"
   *  }
   * })
   */
  create(config?: OptionsInterface) {
    /**
     * Build methods shortcut *Http.get().text()*.
     */
    const methodsBuilder = METHODS.map((method) => {
      return {
        [method]: (path: string, options?: MethodConfigInterface) => {
          let responseType = "json";

          // Response types methods generator.
          const setType = {
            ...Object.assign(
              {},
              ...TYPES_METHODS.map((typeName) => ({
                [typeName]: () => {
                  responseType = typeName;

                  return setType;
                },
              }))
            ),
            then(callback) {
              return new Http(config, {
                path,
                method,
                responseType,
                ...options,
              })
                .httpAdapter()
                .then(callback);
            },
          };

          return setType;
        },
      };
    });

    return Object.assign({}, ...methodsBuilder);
  },
};

// Merge request methods with Reqeza Object.
export default Object.assign(Reqeza, Reqeza.create());
