require("isomorphic-fetch");
import Reqeza from "../src/index";

import { startServer } from "../src/utils/testing-server";

const BASE_URL = "http://localhost:3001";

let http;
let server;

describe("HTTP functionalities", () => {
  beforeAll(() => {
    server = startServer();

    http = Reqeza.create({
      api: {
        url: BASE_URL,
      }
    });

  });

  afterAll(() => {
    server.close()
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
    const { data, status } = await http.get("/book");

    expect(status).toBe(200);

    expect(typeof data).toBe("object");
  });

  // it("Should fetch without creating new instance.", async () => {
  //   const { data, status } = await Reqeza.get<string>(
  //     `${BASE_URL}/text`
  //   ).text();

  //   expect(status).toBe(200);
  //   expect(data).toBe("Hello, world");
  // });

  // it("Should fetch data with the given interface.", async () => {
  //   const { data, status } = await Reqeza.get<{ message: string }>(
  //     `${BASE_URL}/book`
  //   );

  //   expect(status).toBe(200);
  //   expect(data.message).toBe("Hello, world");
  // });

  it("Should change header before sending request to all services.", async () => {
    let headers = { "Authorization": "[LOCAL_TOKEN]" }

    const http = Reqeza.create({
      local: {
        url: BASE_URL,
        headers: {
          "x-custom": "[nothing]",
          "X-API-KEY": "[TOKEN]"
        }
      },
      local2: {
        url: BASE_URL,
        headers: {
          "x-custom": "[nothing]",
        }
      }
    });

    http.setHeaders(headers)

    const { status, config } = await http.local.get("/book").json()
    const { config: opt } = await http.local2.get("/book").json()
    
    expect(status).toBe(200);
    expect(headers.Authorization).toBe(config.headers.get("Authorization"))
    expect(headers.Authorization).toBe(opt.headers.get("Authorization"))

  })

  it("Should set header using function helper setHeader", async () => {
    const http = Reqeza.create({
      local: {
        url: BASE_URL,
      },
    });

    const header = { "Cache-Control": "max-age=604800" }

    http.local.setHeaders(header)

    const { config } = await http.local.get("/book").json();

    expect(config.headers.get("Cache-Control")).toEqual(header["Cache-Control"])
  });

  it("Should Ensure proper merging of method header and global header", async () => {
    const http = Reqeza.create({
      PREFIX_URL: {
        url: BASE_URL,
        headers: {
          'Custom-Header': 'customValue',
        }
      },
    });

    const header = { "Cache-Control": "max-age=604800" }
    const customHeader = { Date: "Tue, 21 Dec 2021 08:00:00 GMT" }

    http.setHeaders(header)

    const { config } = await http.get("/book").json();
    const { config: { headers } } = await http.get("/book", { headers: customHeader }).json()

    const expectedHeaders = expect.objectContaining(config.headers)

    expect(config.headers.get("Cache-Control")).toBe(header["Cache-Control"])
    expect(config.headers.get("Date")).toBeNull()
    expect(config.headers.get("Custom-Header")).toBe("customValue")
    
    // Check if it have global headers
    expect(headers).toEqual(expectedHeaders)
    expect(headers.get("Date")).toBe(customHeader.Date)
  });

  it("Should Set headers if no services are provided.", async () => {
    let headers = { "Authorization": "[LOCAL_TOKEN]" }

    const http = Reqeza.create();

    http.setHeaders(headers)

    const { status, config } = await http.get<{ message: string }>(`${BASE_URL}/book`, {})
    
    expect(status).toBe(200);
    expect(headers.Authorization).toBe(config.headers.get("Authorization"))
  });
  it("Should accept queries as a request option.", async () => {
    const http = Reqeza.create({
      api: { 
        url: BASE_URL,
        qs: {
          arrayFormat: "bracket"
        }
      },
    });

    const fakeDate = { name: "Rich dad, Poor dad" };

    const { data, config } = await http.get<{ message: string }>("/book", {
      qs: { ...fakeDate, limit: 5 },
    })

    const url = new URL(config.url);

    expect(fakeDate.name).toBe(url.searchParams.get("name"));

    expect(data).toEqual({ message: fakeDate.name });
  });

  it("Should send URLSearchParams as body.", async () => {
    const http = Reqeza.create({
      api: {
        url: BASE_URL,
      },
    });

    const title = "Think and grow rich";

    const { status, config } = await http.post("/book", {
      body: new URLSearchParams({ title })
    }).json();

    expect(status).toBe(200)
    expect(config.headers.get("Content-Type")).toBe("application/x-www-form-urlencoded;charset=utf-8")
  });
});
