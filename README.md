# Reqeza `beta_version`

> Tiny JavaScript HTTP client based on browser [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

# Description

🌴 A tiny human-friendly JavaScript HTTP client library based on the browser with no dependencies.

# Features

- [x] Written in TypeScript, First-class TypeScript support
- [x] URL prefix option
- [x] Methods shortcut `*Http.get().text()*`
- [x] Automatic transforms for JSON data
- [x] Simpler API
- [x] Cancel requests
- [ ] Hooks

# Installing

##### 1. Install

In the same directory as your package.json file, create or edit an .npmrc file to include a line specifying GitHub Packages URL.

```bash
@fxomar:registry=https://npm.pkg.github.com
```

Install using npm

```bash
npm install @fxomar/reqeza@2.1.5-beta
```

##### 2. Import and use

To import Reqeza you have to use ECMAScript

```javascript
import Reqeza from "@fxomar/reqeza";
```

Creating new instance of Reqeza to avoid rewriting url over and over again.

```typescript
const http = Reqeza.create(
  // UpperCase always.
  PREFIX_URL: {
    API: "https://jsonplaceholder.typicode.com", // default
    API_2: "https://fakestoreapi.com"
  },
);
```

Easy way to fetch data with methods shortcuts.

```typescript
// Responded data typing.
interface Product {
  id: number;
  title: string;
  ...
  rating: Rating;
}

interface Rating {
  rate: number;
  count: number;
}

/*
 * if you have multiple prefixUrl you can specify which one you want by passing
 * ``PREFIX_URL: NAME`` to the config
 */

// TypeScript version
async function getProduct() {
  try {
    const { data } = await http
      .get<Product>("/products/1", { PREFIX_URL: "API_2" })
      .json();

    console.log(data.title);
  } catch (error) {
    console.error(error);
  }
}

// JavaScript version
async function getProduct() {
  try {
    const { data } = await http.get("/products/1", { PREFIX_URL: "API_2" }).json();

    console.log(data.title);
  } catch (error) {
    console.error(error);
  }
}
```

Performing a `POST` request

```typescript
async function addNewPost() {
  try {
    const res = await http.post("/posts", {
      json: {
        title: "foo",
        body: "bar",
        userId: 1,
      }, // send json post request
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

  const data = await http
    .post("/posts", {
      body: formData,
    })
    .json();
}
```

## API DOCUMENTATION

```typescript
// Creating new instance of Reqeza to avoid rewriting url over and over again.
http.create({ PREFIX_URL: string | { [name: string]: string } })
```

##### Request method aliases

```typescript

// We provided supported for all request methods.
http.get(url | path, options?) // Returns an Object of callable type-setters methods.
// instead of `responseType`.
  json() // By default
  text()
  blob()
  arrayBuffer()
  formData()
http.delete(url | path, options?)

http.head(url | path, options?)

http.options(url | path, options?)

http.post(url[, body or json])

http.put(url[, body or json])

http.patch(url[, body or json])
```

##### Request Config

These are the available `options?` for making requests. Only the url is required.

```typescript
interface Options {
  // To specify which source to fetch from.
  // Using multiple prefixUrls, First will be called by default.
  PREFIX_URL: string | { [name: string]: string }; // Case-sensitive UpperCase always.
  // `headers` are custom headers to be sent.
  headers: Object;
  // `json` to send body as Content-Type JSON.
  json: Object;
  //  `body` to send data under one of these types -
  body:
    | Blob
    | BufferSource
    | FormData
    | URLSearchParams
    | USVString
    | ReadableStream;
  // `responseType` indicates the type of data that the server will respond with.
  responseType: "json" | "text" | "blob" | "arrayBuffer" | "formData";
  // TODO: add ability to auth to your http request if it required

  // `auth` indicates that HTTP Basic auth should be used, and supplies credentials.
  // This will set an `Authorization` header, overwriting any existing
  // `Authorization` custom headers you have set using `headers`.
  // Please note that only HTTP Basic auth is configurable through this parameter.
  // For Bearer tokens and such, use `Authorization` custom headers instead.
  auth: Auth;
  // To cancel request using AbortController
  signal: AbortController;
}

interface Auth {
  username: string;
  password: string;
}
```

### Response Schema

The response for a request contains the following information.

```typescript
interface ResponseInterface<T> {
  // `data` is the response that was provided by the server
  data: T;
  // `headers` the HTTP headers that the server responded with
  // All header names are lower cased and can be accessed using the bracket notation.
  // Example: `response.headers['content-type']`
  headers: unknown;
  // `status` is the HTTP status code from the server response
  status: number;
  // `statusText` is the HTTP status message from the server response
  statusText: string;
  // `config` is the config that was provided to the request
  config: Request;
}
```

## Authors

- [@Omar Chadidi](https://github.com/FxOmar) ❤️
