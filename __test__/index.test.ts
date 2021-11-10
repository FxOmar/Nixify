import http, { createNewInstance } from "../src/index";

describe("Create new instance", () => {
  const result = {
    method: "patch",
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
    expect(http.patch("https://www.google.com/hello")).toEqual(result);
  });

  it("should create shortcut method", () => {});
  it("should take the default prefixUrl", () => {
    const instance = createNewInstance({
      prefixUrl: {
        API: "https://www.google.com",
        API_1: "https://www.airbit.com",
      },
    });

    expect(instance.get("/hello")).toEqual(result);
  });
});
