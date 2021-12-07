require("isomorphic-fetch");
import http from "../src/index";

jest.mock("../src/index");

async function getData() {
  return await http.get("https://jsonplaceholder.typicode.com/todos/1", {
    responseType: "json",
  });
}

describe("Create new instance", () => {
  it("should get data", async () => {
    const todo = {
      userId: 1,
      id: 1,
      title: "delectus aut autem",
      completed: false,
    };

    (http.get as jest.Mock).mockResolvedValueOnce({ data: todo });

    const response = await getData();

    expect(response.data).toEqual(todo);
  });
});
