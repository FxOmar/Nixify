function palve(url, query, callback) {
  const xhr = new XMLHttpRequest();
  const link = new URL(url);

  link.searchParams.set();

  xhr.open("GET", link);

  xhr.responseType = "json";

  xhr.send();
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

  //   xhr.onprogress = function (event) {
  //     if (event.lengthComputable) {
  //       console.log(`Received ${event.loaded} of ${event.total} bytes`);
  //     } else {
  //       console.log(`Received ${event.loaded} bytes`); // no Content-Length
  //     }
  //   };
}

palve(
  "https://jsonplaceholder.typicode.com/posts",
  {
    query: {
      postId: 1,
    },
  },
  async function (error, { status, response }) {
    if (error) {
      // handle error
      console.log(error);
    } else {
      // script loaded successfully
      console.log(status, response);
    }
  }
);
