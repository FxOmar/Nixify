function palve(url, query, callback) {
  const xhr = new XMLHttpRequest();
  const link = new URL(url);

  link.searchParams.set();

  xhr.open("GET", link);

  xhr.responseType = "json";

  xhr.send();

  xhr.onload = () => callback(null, xhr);
  xhr.onerror = () => callback(new Error("Request failed"));

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
