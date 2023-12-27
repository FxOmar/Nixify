require("isomorphic-fetch");
import Reqeza from "../src/index";
import { RequestMethods } from "../src/interfaces";

import { startServer, stopServer } from "../src/utils/testing-server";

const BASE_URL = "http://localhost:3001";

let http: RequestMethods;

describe("HTTP functionalities", () => {
  beforeAll(() => {
    startServer();

    http = Reqeza.create({
      PREFIX_URL: BASE_URL,
    });
  });

  afterAll(() => {
    stopServer();
  });

  it("Should fetch data from API.", async () => {
    const { data, status } = await http.get("/text").text();

    expect(status).toBe(200);
    expect(data).toBe("Hello, world");
  });

  it("Should send POST request to API.", async () => {
    const title = "Think and grow rich";

    const { data, status } = await http
      .post("/book", {
        json: {
          title,
        },
      })
      .json();

    const res = {
      title,
      message: "Book added successfully.",
    };

    expect(status).toBe(200);
    expect(data).toEqual(res);
  });

  it("Should parse response with json by default.", async () => {
    const { data, status } = await http.get("/book").json();

    expect(status).toBe(200);

    expect(typeof data).toBe("object");
  });

  it("Should fetch without creating new instance.", async () => {
    const { data, status } = await Reqeza.get<string>(
      `${BASE_URL}/text`
    ).text();

    expect(status).toBe(200);
    expect(data).toBe("Hello, world");
  });

  it("Should fetch data with the given interface.", async () => {
    const { data, status } = await Reqeza.get<{ message: string }>(
      `${BASE_URL}/book`
    );

    expect(status).toBe(200);
    expect(data.message).toBe("Hello, world");
  });

  it("Should change header before send request", async () => {
    let headers = null

    const http = Reqeza.create({
      PREFIX_URL: {
        API: BASE_URL,
      },
      hooks: {
        beforeRequest(request) {
            headers = Object.assign({}, { Authorization: request.headers.get("Authorization") })
            request.headers.set("Authorization", "Bearer YOUR_ACCESS_TOKEN")
        },
      }
    });

    const { data, status, config } = await http.get("/book").json()
    
    expect(status).toBe(200);
    expect(headers.Authorization).not.toEqual(config.headers.get("Authorization"))

  })

  it("Should accept queries as a request option.", async () => {
    const http = Reqeza.create({
      PREFIX_URL: { 
        API: BASE_URL, 
        API2: BASE_URL,
      },
      qs: {
        arrayFormat: "bracket"
      }
    });

    const fakeDate = { name: "Rich dad, Poor dad" };

    const { data, config } = await http.get<{ message: string }>("/book", {
      PREFIX_URL: "API2",
      qs: { ...fakeDate, limit: 5 },
    })

    const url = new URL(config.url);

    expect(fakeDate.name).toBe(url.searchParams.get("name"));

    expect(data).toEqual({ message: fakeDate.name });
  });

  it("Should set header using function helper setHeader", async () => {
    const http = Reqeza.create({
      PREFIX_URL: {
        API: BASE_URL,
      },
    });

    const header = { "Cache-Control": "max-age=604800" }

    http.setHeaders(header)

    const { config } = await http.get("/book").json();

    expect(config.headers.get("Cache-Control")).toEqual(header["Cache-Control"])
  });

  it("Should send URLSearchParams as body.", async () => {
    const http = Reqeza.create({
      PREFIX_URL: {
        API: BASE_URL,
      },
    });

    const title = "Think and grow rich";

    const { status, config } = await http.post("/book", {
      body: new URLSearchParams({ title })
    }).json();

    expect(status).toBe(200)
    expect(config.headers.get("Content-Type")).toBe("application/x-www-form-urlencoded;charset=utf-8")
  });

  it("Should Ensure proper merging of method header and global header", async () => {
    const http = Reqeza.create({
      PREFIX_URL: {
        API: BASE_URL,
      },
      headers: {
        'Custom-Header': 'customValue',
      }
    });

    const header = { "Cache-Control": "max-age=604800" }
    const customHeader = { Date: "Tue, 21 Dec 2021 08:00:00 GMT" }

    http.setHeaders(header)

    const { config } = await http.get("/book").json();
    const { config: { headers } } = await http.get("/book", { headers: customHeader }).json();

    console.log(config.headers, headers)

    const expectedHeaders = expect.objectContaining(config.headers)

    expect(config.headers.get("Cache-Control")).toBe(header["Cache-Control"])
    expect(config.headers.get("Date")).toBeNull()
    expect(config.headers.get("Custom-Header")).toBe("customValue")
    
    // Check if it have global headers
    expect(headers).toEqual(expectedHeaders)
    expect(headers.get("Date")).toBeTruthy()
  });
});
