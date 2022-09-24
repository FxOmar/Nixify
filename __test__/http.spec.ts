require("isomorphic-fetch");
import Reqeza from "../src/index";

import { startServer, stopServer } from "../src/utils/testing-server";

const BASE_URL = "http://localhost:3001";

let http;

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
    const { data, status } = await http.get("/book");

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
});