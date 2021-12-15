// TODO: Move all interfaces to a separate file.
interface OptionsInterface {
  PREFIX_URL?: { [name: string]: string } | string;
}

interface ResponseInterface {
  data: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers: any;
  status: number;
  statusText: string;
  config: Request;
}

type MethodsType = (
  path: string,
  options?: MethodConfigInterface
) => Promise<ResponseInterface>;

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

class BHR {
  constructor(
    protected __options: OptionsInterface = {},
    protected __methodsConfig
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
      throw new TypeError(error);
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
  httpAdapter() {
    const response = new Response();

    this.__methodsConfig.responseType === undefined
      ? (this.__methodsConfig.responseType = "json")
      : null;

    if (this.__methodsConfig.responseType in response) {
      const requestConfig = this.__configuration;

      return fetch(requestConfig).then(async (res) => {
        /**
         * Retrieve response Header.
         *
         * @param headers
         * @returns Response Headers
         */
        const retrieveHeaders = (headers: Record<string, unknown> = {}) => {
          for (const pair of res.headers.entries()) {
            headers[pair[0]] = pair[1];
          }

          return headers;
        };

        // Response Schema
        const response: ResponseInterface = {
          data: await res.json(),
          headers: retrieveHeaders(),
          status: res.status,
          statusText: res.statusText,
          config: requestConfig,
        };

        return response;
      });
    }
    throw new Error("Response type not supported");
  }
}

/**
 * Create new instance for the given configuration.
 *
 * @param {OptionsInterface} config - PREFIX_URL { API: string: URI: string}
 *
 * @returns {MethodsInterface} - new instance of BHR
 */
export function createNewInstance(config?: OptionsInterface): MethodsInterface {
  const methods = ["get", "head", "put", "delete", "post", "patch", "options"]; // All the HTTP request methods.

  /**
   * Build methods shortcut *Http.get()*.
   */
  const methodsBuilder = methods.map((Method) => ({
    [Method]: (path: string, options?: MethodConfigInterface) => {
      return new BHR(config, {
        method: Method,
        path,
        ...options,
      }).httpAdapter();
    },
  }));

  return Object.assign({}, ...methodsBuilder);
}

const http = createNewInstance();

export default http;
