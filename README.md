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
 * await http.get("/products/1", {  PREFIX_URL: "API_2" });
*/
async function getData() {
  const res = await http.get("/posts/1");

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

### Request method aliases

For convenience aliases have been provided for all supported request methods.

##### http.get(url[, config])

##### http.delete(url[, config])

##### http.head(url[, config])

##### http.options(url[, config])

##### http.post(url[, body || json, config]])

##### http.put(url[, body || json, config]])

##### http.patch(url[, body || json, config]])
