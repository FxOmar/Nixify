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
interface methodsInterface {
  [name: string]: (
    path: string,
    options?: MethodConfigInterface
  ) => Promise<ResponseInterface>;
}

interface MethodConfigInterface {
  PREFIX_URL?: string;
  body?: FormData | URLSearchParams;
  json?: JSON;
  headers?: Headers;
  responseType?: string;
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
    return new Request(this.__parseURI.href, {
      method: this.__methodsConfig.method.toLocaleUpperCase(),
      headers: new Headers(this.__methodsConfig.headers),
      /*
       * Note: The body type can only be a Blob, BufferSource, FormData, URLSearchParams,
       * USVString or ReadableStream type,
       * so for adding a JSON object to the payload you need to stringify that object.
       */
      body: Object.hasOwnProperty.call(this.__methodsConfig, "json")
        ? JSON.stringify(this.__methodsConfig.json)
        : this.__methodsConfig.body, // body data type must match "Content-Type" header
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
      return fetch(this.__configuration).then(async (res) => {
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
          config: this.__configuration,
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
 * @returns {methodsInterface} - new instance of BHR
 */
export function createNewInstance(config?: OptionsInterface): methodsInterface {
  const methods: string[] = [
    "get",
    "head",
    "put",
    "delete",
    "post",
    "patch",
    "options",
  ]; // All the HTTP request methods.

  const instance: methodsInterface = {};

  /**
   * Build methods shortcut *Http.get()*.
   */
  for (let index = 0; index <= methods.length - 1; index++) {
    const method = methods[index];

    instance[method] = (path: string, options?: MethodConfigInterface) => {
      return new BHR(config, {
        method: method,
        path,
        ...options,
      }).httpAdapter();
    };
  }

  return instance;
}

const http = createNewInstance();

export default http;
