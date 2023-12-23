/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CreateNewInstance,
  MethodConfig,
  Options,
  RequestMethods,
  RequestMethodsType,
  ResponseInterface,
  queryType,
} from "./interfaces";
import { ResponseError, getBaseUrl, has } from "./utils";

const __configuration = (
  config: Options,
  methodConfig: MethodConfig,
  method: NonNullable<RequestInit["method"]>
): Request => {
  const __parseURI = new URL(
    methodConfig.path,
    getBaseUrl(config, methodConfig)
  );

  // https://felixgerschau.com/js-manipulate-url-search-params/
  // Add queries to the url
  has(methodConfig, "qs")
    ? (__parseURI.search = new URLSearchParams(
        methodConfig.qs as queryType
      ).toString())
    : null;

  const headersConfig = new Headers({
    ...config?.headers,
    ...methodConfig?.headers,
  });

  /**
   * if body is json, then set headers to content-type JSON
   */
  if (
    ["post", "put", "patch"].includes(method) &&
    has(methodConfig, "json") &&
    !has(methodConfig, "headers['Content-Type']")
  ) {
    headersConfig.append("Content-Type", "application/json; charset=UTF-8");
  }

  return new Request(__parseURI.toString(), {
    method: method.toLocaleUpperCase(),
    headers: headersConfig,
    /*
     * Note: The body type can only be a Blob, BufferSource, FormData, URLSearchParams,
     * USVString or ReadableStream type,
     * so for adding a JSON object to the payload you need to stringify that object.
     */
    body: has(methodConfig, "json")
      ? JSON.stringify(methodConfig.json)
      : methodConfig.body, // body data type must match "Content-Type" header

    // Cancel request
    signal: methodConfig.signal,
    cache: methodConfig.cache,
    credentials: methodConfig.credentials,
    integrity: methodConfig.integrity,
    keepalive: methodConfig.keepalive,
    mode: methodConfig.mode,
    redirect: methodConfig.redirect,
    referrer: methodConfig.referrer,
    referrerPolicy: methodConfig.referrerPolicy,
  });
};

/**
 * HttpAdapter for making http requests 🦅 to the given API'S.
 *
 * @returns {Promise<ResponseInterface>}
 */
const httpAdapter = async <R>(
  config: Options,
  method: NonNullable<RequestInit["method"]>,
  methodConfig: MethodConfig
) => {
  const requestConfig = __configuration(config, methodConfig, method);

  // Call the beforeRequest hook for the main config if it exists
  config?.hooks?.beforeRequest &&
    (await config.hooks.beforeRequest(requestConfig));

  // Call the beforeRequest hook for the method config if it exists
  methodConfig?.hooks?.beforeRequest &&
    (await methodConfig.hooks.beforeRequest(requestConfig));

  return fetch(requestConfig)
    .then((res) => ResponseError(res, requestConfig, config))
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
        data: await res[methodConfig.responseType](),
        headers: retrieveHeaders(),
        status: res.status,
        statusText: res.statusText,
        config: requestConfig,
      };

      return response;
    });
};

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
    // All the HTTP request methods.
    const METHODS = [
      "get",
      "head",
      "put",
      "delete",
      "post",
      "patch",
      "options",
    ];

    const responseTypes = ["json", "text", "blob", "arrayBuffer", "formData"];

    let headers = {}; // Initial headers

    const Reqeza = {
      setHeaders: (newHeaders) => {
        headers = { ...headers, ...newHeaders };
      },
    };

    /**
     * Build methods shortcut *Http.get().text()*.
     */
    METHODS.forEach((method) => {
      Reqeza[method] = (
        path: string,
        options?: MethodConfig
      ): RequestMethodsType => {
        let responseType = "json";

        // Response types methods generator.
        const responseHandlers = {
          ...Object.assign(
            {},
            ...responseTypes.map((typeName) => ({
              [typeName]: () => {
                responseType = typeName;

                return responseHandlers;
              },
            }))
          ),
          // https://javascript.plainenglish.io/the-benefit-of-the-thenable-object-in-javascript-78107b697211
          then(callback) {
            httpAdapter(config, method, {
              path,
              headers,
              responseType,
              ...options,
            }).then(callback);
          },
        };

        return responseHandlers;
      };
    });

    return Reqeza as RequestMethods;
  },
};

// Merge request methods with Reqeza Object.
export default { ...Reqeza, ...Reqeza.create() };
