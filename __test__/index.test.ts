import http, { createNewInstance } from "../src/index";

describe("Create new instance", () => {
  const result = {
    method: "get",
    path: "/hello",
    prefixUrl: "https://www.google.com",
  };
  it("should create a new instance", () => {
    const instance = createNewInstance({
      prefixUrl: "https://www.google.com",
    });

    expect(instance.get("/hello")).toEqual(result);
  });

  it("should create new instance without configurations", () => {
    expect(http.get("https://www.google.com/hello")).toEqual(result);
  });
});
