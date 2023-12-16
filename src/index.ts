import {
  CreateNewInstance,
  MethodConfig,
  Options,
  RequestMethods,
  RequestMethodsType,
  ResponseInterface,
  queryType,
} from "./interfaces";
import { ValidationError, ResponseError, has } from "./utils";

// All the HTTP request methods.
const METHODS = ["get", "head", "put", "delete", "post", "patch", "options"];
// Response types
const TYPES_METHODS = ["json", "text", "blob", "arrayBuffer", "formData"];

class Http {
  constructor(
    protected __options: Options = {},
    protected __methodsConfig: MethodConfig
  ) {
    this.__options = __options;
    this.__methodsConfig = __methodsConfig;
  }

  /**
   * Parse the given URI
   */
  protected get __parseURI(): URL {
    try {
      const BASE_URL =
        !has(this.__options, "PREFIX_URL") || this.__options.PREFIX_URL === null
          ? undefined
          : typeof this.__options.PREFIX_URL === "object" &&
            this.__methodsConfig.PREFIX_URL
          ? this.__options.PREFIX_URL[this.__methodsConfig.PREFIX_URL]
          : Object.values(this.__options.PREFIX_URL)[0];

      const url = new URL(this.__methodsConfig.path, BASE_URL);

      // https://felixgerschau.com/js-manipulate-url-search-params/
      // Add queries to the url
      has(this.__methodsConfig, "qs")
        ? (url.search = new URLSearchParams(
            this.__methodsConfig.qs as queryType
          ).toString())
        : null;

      return url;
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
      has(this.__methodsConfig, "json") &&
      !has(this.__methodsConfig, "headers['Content-Type']")
    ) {
      headersConfig.append("Content-Type", "application/json; charset=UTF-8");
    }

    return new Request(this.__parseURI.toString(), {
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

        // Response Schema
        const response: ResponseInterface<R> = {
          data: await res[this.__methodsConfig.responseType](),
          headers: retrieveHeaders(),
          status: res.status,
          statusText: res.statusText,
          config: requestConfig,
        };

        return response;
      });
  }
}

const Reqeza: CreateNewInstance = {
  /**
   * Create new instance for the given configuration.
   *
   * @param {Options} config - PREFIX_URL { API: string: URI: string}
   *
   * @returns {Methods} - new instance of Http
   *
   * @example
   * const http = Reqeza.create({
   *  PREFIX_URL: {
   *    API: "https://api.github.com"
   *  }
   * })
   */
  create(config?: Options): RequestMethods {
    /**
     * Build methods shortcut *Http.get().text()*.
     */
    const methodsBuilder = METHODS.map((method) => {
      return {
        [method]: (
          path: string,
          options?: MethodConfig
        ): RequestMethodsType => {
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
            // https://javascript.plainenglish.io/the-benefit-of-the-thenable-object-in-javascript-78107b697211
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
