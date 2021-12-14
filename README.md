# BHR

> Tiny JavaScript HTTP client based on the browser.

# Description

🌴 A Tiny human-friendly JavaScript HTTP client library based on the browser with no dependencies, to fetch data from API(s).

# Features

- [x] Make [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) from the browser
- [x] Create a prefix - **_`\_API/_**endpint`
- [ ] Cancel requests
- [x] Automatic transforms for JSON data
- [ ] Simpler API - in progress
- [ ] Lifecycle hooks for the request
- [x] Methods shortcut `*Http.get()*`

# Installing

Package manager

```bash
npm install bhr-maker
```

Using UNPKG CDN:

```html
<script src="https://unpkg.com/package-name/dist/package-name.min.js"></script>
```

# Example

To import BHR you have to use ECMAScript

```javascript
import http from "bhr-maker";
```

Creating new instance of BHR to avoid rewriting url over and over again.

```javascript
import { createNewInstance } from "bhr-maker";

const http = createNewInstance(
  PREFIX_URL: {
    API: "https://jsonplaceholder.typicode.com", // this one is the default API
    API_2: "https://fakestoreapi.com"
  },
);

/*
 * if you have multiple prefixUrl you can specify which one you want by passing
 * ``PREFIX_URL: NAME`` to the config
*/
async function getData() {
  const res = await http.get("/posts/1" , { PREFIX_URL: "API" });

  console.log(res.data);
}

```

Performing a GET request is made easy for you

```javascript
// Want to use async/await? Add the `async` keyword to your outer function/method.
async function getPosts() {
  try {
    const res = await http.get("/posts");
    console.log(res);
  } catch (error) {
    console.error(error);
  }
}

http
  .get("posts")
  .then((res) => {
    console.log(res.data);
  })
  .catch((e) => {
    console.error(e);
  });
```

Performing a POST request

```javascript
async function addNewPost() {
  try {
    const res = await http.post("/posts", {
      json: {
        title: "foo",
        body: "bar",
        userId: 1,
      },
    });
    console.log(res);
  } catch (error) {
    console.error(error);
  }
}

/*
 * if your request body is Blob, BufferSource, FormData, URLSearchParams,
 *  USVString or ReadableStream type,
 * then you have to use {body} instead of {json} keyword.
 */
async function addNewPost() {
  const formData = new FormData();

  formData.append("title", "abc123");
  formData.append("body", "bar");
  formData.append("userId", 1);

  const data = await http.post("posts", {
    body: formData,
  });
}
```

# API

#### Request method aliases

We provided supported for all request methods.

##### http.get(url[, config])

##### http.delete(url[, config])

##### http.head(url[, config])

##### http.options(url[, config])

##### http.post(url[, body or json, config])

##### http.put(url[, body or json, config])

##### http.patch(url[, body or json, config])

### Creating an instance

You can create a new instance of `BHR` with a custom config.
` http.createNewInstance([config])`

```javascript
const instance = createNewInstance(
  PREFIX_URL: "https://jsonplaceholder.typicode.com" // or
  // You can pass an object of PREFIX_URL
  PREFIX_URL: {
    API: "https://jsonplaceholder.typicode.com", // this one is the default API
    API_2: "https://fakestoreapi.com"
  },
);
```

### Request Config

These are the available config options for making requests. Only the url is required.

```javascript
{
  // To specify which api you wanna use from the instance
  PREFIX_URL: "NAME", // default is the first on in the instance PREFIX_URL object

  // `headers` are custom headers to be sent
  headers: {
    "Content-Type": "multipart/form-data; boundary=something"
  },

  // `json` to send body as Content-Type JSON
  json: {
    "id":1,
    "title":"Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    "price":109.95
  },

  /*
  * `body` to send data under one of these types Blob, BufferSource, FormData URLSearchParams,
  * USVString or ReadableStream
  */
  body: FormData,

  // `responseType` indicates the type of data that the server will respond with
  // options are: 'arraybuffer', 'document', 'json', 'text', 'stream', 'blob'
  responseType: 'json', // default
},

// TODO: add ability to auth to your http request if it required

// `auth` indicates that HTTP Basic auth should be used, and supplies credentials.
// This will set an `Authorization` header, overwriting any existing
// `Authorization` custom headers you have set using `headers`.
// Please note that only HTTP Basic auth is configurable through this parameter.
// For Bearer tokens and such, use `Authorization` custom headers instead.
auth: {
  username: 'janedoe',
  password: 's00pers3cret'
},

// To cancel Http requests using AbortController
signal: new AbortController().signal,
```

### Response Schema

The response for a request contains the following information.

```javascript
{
  // `config` is the config that was provided to the request
  config: {},

  // `data` is the response that was provided by the server
  data: {},

  // `status` is the HTTP status code from the server response
  status: 200,

  // `statusText` is the HTTP status message from the server response
  statusText: 'OK',

  // `headers` the HTTP headers that the server responded with
  // All header names are lower cased and can be accessed using the bracket notation.
  // Example: `response.headers['content-type']`
  headers: {},
}
```
