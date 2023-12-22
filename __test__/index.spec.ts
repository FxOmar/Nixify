require("isomorphic-fetch");
import Reqeza from "../src/index";

const BASE_URL = "http://localhost:3001";

jest.mock("isomorphic-fetch");

describe("Creating new instance of http.", () => {
  it("Should have all HTTP request methods", async () => {
    const http = Reqeza.create({
      PREFIX_URL: {
        API: BASE_URL,
      },
    });

    const METHODS = [
      "get",
      "head",
      "put",
      "delete",
      "post",
      "patch",
      "options",
    ];

    METHODS.forEach((prop) => {
      expect(typeof http[prop]).toBe("function");
      expect(http).toHaveProperty(prop);
    });
  });

  it("Methods should return setType methods.", async () => {
    const http = Reqeza.create({
      PREFIX_URL: {
        API: BASE_URL,
      },
    });

    const TYPES_METHODS = ["json", "text", "blob", "arrayBuffer", "formData"];

    TYPES_METHODS.forEach(async (prop) => {
      expect(http.get("/hello")).toHaveProperty(prop);
    });
  });
  
  // it("Should return error with invalid url.", async () => {
  //   const http = Reqeza.create();

  //   async function fetch() {
  //     try {
  //       const { data } = await http.get("fakestoreapi.com/products").json()
  //       return data;
  //     } catch (error) {
  //       return error;
  //     }
  //   }

  //   const res = await fetch();

  //   console.log(res)

  //   expect(res.toJSON().error.message).toBe("The given URI is invalid.");
  // });
});
