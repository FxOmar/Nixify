const REQUEST_METHODS = ["get"];

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

    request.onreadystatechange = function () {
      const responseData =
        !config.responseType || config.responseType === "text"
          ? request.responseText
          : request.response;

      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        // headers: responseHeaders,
      };
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.readyState === 4 || request.status === 200) {
          resolve(response);
        } else {
          reject(
            new Error(
              "Request failed with status code " + response.status,
              null,
              response
            )
          );
        }
      }
    };

    request.send();
  });
}

requestP({
  method: "GET",
  url: "https://jsonplaceholder.typicode.com/comments?postId=1",
  responseType: "json",
})
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

// function validateAndMerge(...sources) {
//   for (const source of sources) {
//     if (
//       (!isObject(source) || Array.isArray(source)) &&
//       typeof source !== "undefined"
//     ) {
//       throw new TypeError("The `options` argument must be an object");
//     }
//   }

//     return deepMerge({}, ...sources);
// }

// function createInstance(defaults) {
//   const palve = (input, options) =>
//     new palve(input, validateAndMerge(defaults, options));

//   for (const method of REQUEST_METHODS) {
//     palve[method] = (input, options) =>
//       new palve(input, validateAndMerge(defaults, options, { method }));
//   }

//   return palve;
// }
