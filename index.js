"use strict";

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) error.code = code;

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = () => ({
    // Standard
    message: this.message,
    name: this.name,
    // Microsoft
    description: this.description,
    number: this.number,
    // Mozilla
    fileName: this.fileName,
    lineNumber: this.lineNumber,
    columnNumber: this.columnNumber,
    stack: this.stack,
    // Axios
    config: this.config,
    code: this.code,
  });
  return error;
}

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
function createError(message, config, code, request, response) {
  const error = new Error(message);
  return enhanceError(error, config, code, request, response);
}

/**
 *
 * @param {*} header
 * @returns headers parse as an object
 */
function parseHeader(header) {
  const headers = {};

  header
    .trim()
    .split(/[\r\n]+/)
    .map((value) => value.split(/: /))
    .forEach((keyValue) => {
      headers[keyValue[0].trim()] = keyValue[1].trim();
    });

  return headers;
}

function getStatus(status) {
  return status === 1223 ? 204 : status; // IE9 fix
}

/**
 *
 * @param {*} config
 * @returns Promise
 */
function requestP(config) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();

    console.log(config);

    request.open(config.method, config.url, true);

    request.responseType = config.responseType;

    request.timeout = config.timeout;

    request.onreadystatechange = function () {
      if (request.readyState !== XMLHttpRequest.DONE || request.status === 0) {
        return;
      }

      const responseData =
        !config.responseType || config.responseType === "text"
          ? request.responseText
          : request.response;

      const response = {
        data: responseData,
        status: getStatus(request.status),
        headers: parseHeader(request.getAllResponseHeaders()),
        config: config,
        request: request,
      };

      if (request.status === 200) {
        resolve(response);
      } else {
        reject(
          createError(
            "Request failed with status code " + response.status,
            response.config,
            null,
            response.request,
            response
          )
        );
        request = null;
      }
    };

    request.ontimeout = function (e) {
      reject(
        createError(
          "timeout of " + config.timeout + "ms exceeded",
          config,
          "ECONNABORTED",
          null,
          null
        )
      );

      request = null;
    };

    request.send();
  });
}

const REQUEST_METHODS = ["get", "post", "put"];

/**
 *
 * @param {*} defaults
 * @returns
 */
function createInstance() {
  for (const method of REQUEST_METHODS) {
    requestP[method] = () => requestP({ method: method });
  }

  return requestP;
}
const requestPa = createInstance();

requestPa
  .get("https://jsonplaceholder.typicode.com/comments?postId=1")
  .then((re) => {
    console.log(re);
  });

// requestP({
//   method: "get",
//   url: "https://jsonplaceholder.typicode.com/comments?postId=1",
//   responseType: "json",
// })
//   .then(function (response) {
//     console.log(response);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

// async function getPosts() {
//   const res = await requestP({
//     method: "GET",
//     url: "https://jsonplaceholder.typicode.com/comments?postId=1",
//     responseType: "json",
//   });

//   console.log(res.data);
// }
// getPosts();
