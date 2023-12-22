/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CreateNewInstance,
  MethodConfig,
  Options,
  RequestMethods,
  RequestMethodsType,
  queryType,
} from "./interfaces";
import { ResponseError, has } from "./utils";

const __configuration = (
  config: Options,
  methodConfig: MethodConfig
): Request => {
  const __parseURI = new URL(
    methodConfig.path,
    !has(config, "PREFIX_URL") || config.PREFIX_URL === null
      ? undefined
      : typeof config.PREFIX_URL === "object" && methodConfig.PREFIX_URL
      ? config.PREFIX_URL[methodConfig.PREFIX_URL]
      : Object.values(config.PREFIX_URL)[0]
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
    ["post", "put", "patch"].includes(methodConfig.method) &&
    has(methodConfig, "json") &&
    !has(methodConfig, "headers['Content-Type']")
  ) {
    headersConfig.append("Content-Type", "application/json; charset=UTF-8");
  }

  return new Request(__parseURI.toString(), {
    method: methodConfig.method.toLocaleUpperCase(),
    credentials: "same-origin",
    headers: headersConfig,
    /*
     * Note: The body type can only be a Blob, BufferSource, FormData, URLSearchParams,
     * USVString or ReadableStream type,
     * so for adding a JSON object to the payload you need to stringify that object.
     */
    body: Object.hasOwnProperty.call(methodConfig, "json")
      ? JSON.stringify(methodConfig.json)
      : methodConfig.body, // body data type must match "Content-Type" header

    // Cancel request
    signal: methodConfig.signal,
  });
};

/**
 * HttpAdapter for making http requests 🦅 to the given API'S.
 *
 * @returns {Promise<ResponseInterface>}
 */
const httpAdapter = async (config: Options, methodConfig: MethodConfig) => {
  const requestConfig = __configuration(config, methodConfig);

  // Call the beforeRequest hook for the main config if it exists
  config?.hooks?.beforeRequest &&
    (await config.hooks.beforeRequest(requestConfig));

  // Call the beforeRequest hook for the method config if it exists
  methodConfig?.hooks?.beforeRequest &&
    (await methodConfig.hooks.beforeRequest(requestConfig));

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
      const response = {
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
      setHeaders: (newHeaders: Headers) => {
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
            httpAdapter(config, {
              path,
              method,
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

// METHODS.forEach((method) => {
//   Reqeza[method] = <T>(path: string, options?: MethodConfig) => {
//     const requestPromise = new Promise<ResponseInterface<T>>(
//       (resolve, reject) => {
//         httpAdapter(config, {
//           path,
//           method,
//           headers,
//           responseType,
//           ...options,
//         }).then((response: ResponseInterface<T>) => {
//           resolve(response);
//         });
//       }
//     );

//     // const responseHandlers: ResponseHandlers<T> = {
//     //   json: () => requestPromise.then((response) => response),
//     //   text: () =>
//     //     requestPromise.then((response) => ({
//     //       ...response,
//     //       ...response.data,
//     //       data: JSON.stringify(response.data),
//     //     })),
//     //   blob: () =>
//     //     requestPromise.then((response) => ({
//     //       ...response,
//     //       ...response.data,
//     //       data: new Blob([JSON.stringify(response.data)], {
//     //         type: "application/json",
//     //       }),
//     //     })),
//     //   arrayBuffer: () =>
//     //     requestPromise.then((response) => ({
//     //       ...response,
//     //       ...response.data,
//     //       data: toArrayBuffer(response.data),
//     //     })),
//     //   formData: () =>
//     //     requestPromise.then((response) => ({
//     //       ...response,
//     //       ...response.data,
//     //       data: toFormData(response.data),
//     //     })),
//     // };

//     // Response types methods generator.
//     const responseHandlers = {
//       ...Object.assign(
//         {},
//         ...TYPES_METHODS.map((typeName) => ({
//           [typeName]: () => {
//             responseType = typeName;

//             return requestPromise;
//           },
//         }))
//       ),
//     };

//     return responseHandlers;
//   };
// });
