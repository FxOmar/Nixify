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
    // Request
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

const isObject = (value) => value !== null && typeof value === "object";

const deepMerge = (...sources) => {
  let returnValue = {};
  let headers = {};

  for (const source of sources) {
    if (Array.isArray(source)) {
      if (!Array.isArray(returnValue)) {
        returnValue = [];
      }

      returnValue = [...returnValue, ...source];
    } else if (isObject(source)) {
      for (let [key, value] of Object.entries(source)) {
        if (isObject(value) && key in returnValue) {
          value = deepMerge(returnValue[key], value);
        }

        returnValue = { ...returnValue, [key]: value };
      }

      if (isObject(source.headers)) {
        headers = mergeHeaders(headers, source.headers);
      }
    }

    returnValue.headers = headers;
  }

  return returnValue;
};

const validateAndMerge = (...sources) => {
  for (const source of sources) {
    if (
      (!isObject(source) || Array.isArray(source)) &&
      typeof source !== "undefined"
    ) {
      throw new TypeError("The `options` argument must be an object");
    }
  }

  return deepMerge({}, ...sources);
};

/**
 *
 * @param {*} defaults
 * @returns
 */
const createInstance = (defaults) => {
  for (const method of REQUEST_METHODS) {
    requestP[method] = (input) =>
      requestP(validateAndMerge(input, defaults, { method }));
  }

  return requestP;
};
const requestPa = createInstance();

function inputElement(text, type) {
  const input = document.createElement(type);
  if (type === "input") {
    input.setAttribute("type", "text");
  } else {
    input.setAttribute("rows", "10");
    input.setAttribute("cols", "50");
  }

  input.value += text;

  return input;
}

function replaceElements(props) {
  const input = inputElement(props.text, props.typeOf);
  if (props.typeOf) {
    props.el.replaceWith(input);
  }
}

function handleClickElements(el) {
  document.addEventListener("click", (evt) => {
    let targetElement = evt.target; // clicked element

    const type = el.tagName === "P" ? "textarea" : "input";

    do {
      if (targetElement == el) {
        const props = { el: el, text: el.textContent, typeOf: type };
        replaceElements(props);
        return;
      }
      // Go up the DOM
      targetElement = targetElement.parentNode;
    } while (targetElement);

    // This is a click outside.
    const input = document.getElementsByTagName(type);
    input[0].replaceWith(el);
  });
}

function createElement(elements, id) {
  const parentDiv = document.createElement("div");

  for (const [key, value] of Object.entries(elements)) {
    const el = document.createElement(key);
    el.textContent = value;

    parentDiv.setAttribute("id", id);
    parentDiv.appendChild(el);

    el.onclick = function (event) {
      handleClickElements(el);
    };
  }

  document.getElementById("posts").appendChild(parentDiv);
}

async function getPosts(path) {
  const url = new URL("https://jsonplaceholder.typicode.com/posts/");
  url.pathname += path ? path : "";

  const res = await requestP({
    method: "get",
    url: url,
    responseType: "json",
  });

  const data =
    typeof res.data === "object" && Array.isArray(res.data) && res.data !== null
      ? res.data
      : [res.data];

  data.forEach(({ title, body, id }) => {
    createElement({ h1: title, p: body }, id);
  });
}

getPosts();

// requestPa
//   .get("https://jsonplaceholder.typicode.com/comments?postId=1")
//   .then((re) => {
//     console.log(re);
//   });

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
