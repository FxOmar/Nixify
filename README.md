# Reqeza HTTP Client Library

> Reqeza is a lightweight and minimalistic JavaScript HTTP client based on the browser's [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). It's designed for simplicity and ease of use in browser environments, providing a concise API for making HTTP requests to various services.

## Installation

#### Package manager

Using npm:
```bash
npm install reqeza
```
Using pnpm:
```bash
pnpm add reqeza
```
Using yarn:
```bash
yarn add reqeza
```

To import Reqeza you have to use ECMAScript

```javascript
import Reqeza from "reqeza";
```

## Features
- **Tiny and Lightweight**: Reqeza is a minimalistic HTTP client focused on simplicity and a small footprint.

- **First-class TypeScript support**: Developed using TypeScript, ensuring a seamless and robust experience for TypeScript users.

- **Fetch API Integration**: Built on top of the browser's Fetch API, leveraging its capabilities for making HTTP requests.

- **Methods Shortcut**: Utilize shorthand methods for common tasks, such as `*FetchLite.get().text()*`, to enhance code readability.

- **Service Configuration**: Easily configure and create instances for different services.

- **Header Management**: Set headers globally or for specific service instances. Modify headers before making requests, providing flexibility for customization.

- **Hooks**: Execute functions before making requests for both global and service-specific instances. Modify request headers or perform other actions.

- **Concise API**: Provides a straightforward and easy-to-use API for handling HTTP requests without unnecessary complexity.

- **Automatic Transforms for JSON Data**: Enjoy automatic handling of JSON data, simplifying the interaction with APIs that return JSON responses.

- **Cancel Requests**: Efficiently manage ongoing requests with the ability to cancel them as needed.


## Usage

```typescript
// Create an instance of Reqeza with predefined services
const http = Reqeza.create({
  github: {
    url: "https://api.github.com",
    headers: {
      "x-API-KEY": "[TOKEN]",
    },
  },
  gitlab: {
    url: "https://gitlab.com/api/v4",
    headers: {},
  },
});

// Set headers for a specific service instance
http.gitlab.setHeaders({ Authorization: `Bearer ${token}` });

// Set headers globally
http.setHeaders({ Authorization: `Bearer ${token}` });

// Set headers before making a request for a specific service instance
http.gitlab.beforeRequest((request, config) => {
  // Modify request headers or perform other actions
});

// Set headers globally before making a request
http.beforeRequest((request, config) => {
  request.headers.set("Content-type", "application/json");
});

// Make HTTP requests
const { data, config } = await http
  .get("https://api.github.com/search/repositories", { headers: {} })
  .json();
const { data, status } = await http.github.get("/search/repositories").json();

/**
 * If the body of the HTTP request is an instance of URLSearchParams,
 * The Content-Type is set automatically by `fetch`, 
 * so we didn't have to explicit set it to 'application/x-www-form-urlencoded;charset=utf-8'.
 */
const searchParams = new URLSearchParams();
searchParams.set('food', 'sushi 🍣');
searchParams.set('drink', 'Bubble Tea 🧋');

const { data } = await http.post(path, { body: searchParams })

/**
 * `fetch` automatically sets the Content-Type header,
 *  So we didn't have to explicit set it to 'multipart/form-data; boundary=---....'
 */
const formData = new FormData();
formData.append('username', 'superAdmin');
formData.append('password', 'admin1234');

const { data } = await http.post(path, { body: formData })
```

## API DOCUMENTATION
##### `Reqeza.create(config: { [name: string]: Options }): ServiceReqMethods | RequestMethods`

Creates an instance of Reqeza with predefined service configurations.

##### Parameters:

- `config`: An object containing service configurations.

##### Returns:

- `ReqezaInstance`: An instance of Reqeza configured with the provided options.

##### Example:

```typescript
const http = Reqeza.create({
  github: {
    url: "https://api.github.com",
    headers: {
      "x-API-KEY": "[TOKEN]",
    },
  },
  gitlab: {
    url: "https://gitlab.com/api/v4/",
    headers: {},
  },
});
```

##### `Reqeza.beforeRequest(fn: (request: Request, config: Options) => void)`
##### `Reqeza.{service}.beforeRequest(fn: (request: Request, config: Options) => void)`
Prior to initiating a request for a particular service instance or globally, customize request headers or execute additional actions.

##### Parameters:

- `request`: A representation of the Request API, encapsulating HTTP configurations.
- `config`: An object with `ReqezaInstance` configurations.

##### Example:

```typescript
// Set headers before making a request for a specific service instance
http.gitlab.beforeRequest((request, config) => {
  // Modify request headers or perform other actions
});

// Set headers globally before making a request
http.beforeRequest((request, config) => {
  request.headers.set("Content-type", "application/json");
});
```
##### `Reqeza.setHeaders(headers: { [key: string]: string })`
##### `Reqeza.{service}.setHeaders(headers: { [key: string]: string })`
Before making a request for a specific service instance or globally, modify request headers.

##### Parameters:

- `headers`: An object containing headers.

##### Example:

```typescript
// Set headers for a specific service instance
http.gitlab.setHeaders({ Authorization: `Bearer ${token}` });

// Set headers globally
http.setHeaders({ Authorization: `Bearer ${token}` });
```

#### Request method aliases

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


```typescript
// These are the available `options?` for making requests. Only the url is required.
interface Options {
  url: string
  headers?: { [key: string]: string }
  hooks?: { beforeRequest: (request: Request, config: Options) => void }
  qs?: StringifyOptions
}

// https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options
interface MethodConfig extends Omit<RequestInit, "method"> {
  // URL parameters to be sent with the request
  // (e.g http.get(path, { qs: { name: "Joe" } }) = path?name=Joe )
  qs?: { [name: string]: string | URLSearchParams | Record<string, string> | string[][] }
  // `headers` are custom headers to be sent.
  headers?: Object;
  // `json` to send body as Content-Type JSON.
  json?: Object;
  //  `body` to send data under one of these types -
  body?:
    | Blob
    | BufferSource
    | FormData
    | URLSearchParams
    | USVString
    | ReadableStream;
  // `responseType` indicates the type of data that the server will respond with.
  responseType?: "json" | "text" | "blob" | "arrayBuffer" | "formData";
  //   hooks?: { beforeRequest: (request: Request) => void };
  auth?: { username: string; password: string }
  // To cancel request using AbortController
  signal?: AbortController;
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
  headers: Headers;
  // `status` is the HTTP status code from the server response
  status: number;
  // `statusText` is the HTTP status message from the server response
  statusText: string;
  // `config` is the config that was provided to the request
  config: Request;
}
```

## Contributing

We welcome contributions! Feel free to open issues, submit pull requests, or provide feedback. Make sure to follow our [contribution guidelines](CONTRIBUTING.md).


## Authors
- [@Omar Chadidi](https://github.com/FxOmar) ❤️

## License

This library is licensed under the [MIT License](LICENSE).
