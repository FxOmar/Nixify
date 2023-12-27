/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CreateNewInstance,
  MethodConfig,
  Options,
  RequestMethods,
  RequestMethodsType,
  ResponseInterface,
} from "./interfaces";
import {
  ResponseError,
  getBaseUrl,
  has,
  caseless,
  qs,
  mergeHeaders,
} from "./utils";

const headers = {}; // Initial headers

const _caseless = caseless(headers);

const __configuration = (
  config: Options,
  methodConfig: MethodConfig,
  method: NonNullable<RequestInit["method"]>
): Request => {
  const BASE_URL = new URL(methodConfig.path, getBaseUrl(config, methodConfig));

  // https://felixgerschau.com/js-manipulate-url-search-params/
  // Add queries to the url
  /**
   * Reqeza.create({
   *  PREFIX_URL: path,
   *  qs: { strict: true }
   * })
   **/
  has(methodConfig, "qs")
    ? (BASE_URL.search = qs.stringify(methodConfig.qs, config?.qs))
    : null;

  let headersConfig = new Headers(headers);

  if (methodConfig.headers) {
    headersConfig = mergeHeaders(headersConfig, methodConfig.headers);
  }

  /**
   * if body is json, then set headers to content-type JSON
   */
  if (has(methodConfig, "json")) {
    methodConfig.body = JSON.stringify(methodConfig.json);
    headersConfig.append("Content-Type", "application/json; charset=UTF-8");
    delete methodConfig.json;
  }

  if (methodConfig?.body instanceof URLSearchParams) {
    headersConfig.append(
      "Content-Type",
      "application/x-www-form-urlencoded;charset=utf-8"
    );
  }

  return new Request(BASE_URL.toString(), {
    method: method.toLocaleUpperCase(),
    headers: headersConfig,
    /*
     * Note: The body type can only be a Blob, BufferSource, FormData, URLSearchParams,
     * USVString or ReadableStream type,
     * so for adding a JSON object to the payload you need to stringify that object.
     */
    body: methodConfig.body,

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
    ] as const;

    const responseTypes = {
      json: "application/json",
      text: "text/*",
      formData: "multipart/form-data",
      arrayBuffer: "*/*",
      blob: "*/*",
    } as const;

    const Reqeza = {
      setHeaders(newHeader) {
        for (const key in newHeader) {
          _caseless.set(key, newHeader[key]);
        }
      },
    };

    if (config?.headers) {
      Reqeza.setHeaders(config.headers);
    }

    /**
     * Build methods shortcut *Http.get().text()*.
     */
    METHODS.forEach((method) => {
      Reqeza[method] = (
        path: string,
        options?: MethodConfig
      ): RequestMethodsType => {
        let responseType = "json";

          Reqeza.setHeaders({
          });
        }

        // Response types methods generator.
        const responseHandlers = {
          ...Object.assign(
            {},
            ...Object.entries(responseTypes).map(([typeName, mimeType]) => ({
              [typeName]: () => {
                Reqeza.setHeaders({
                  accept: mimeType,
                });

                responseType = typeName;

                return responseHandlers;
              },
            }))
          ),
          // https://javascript.plainenglish.io/the-benefit-of-the-thenable-object-in-javascript-78107b697211
          then(callback) {
            httpAdapter(config, method, {
              path,
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
