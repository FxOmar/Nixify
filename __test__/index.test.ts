require("isomorphic-fetch");
import http from "../src/index";

const BASE_URL = "https://jsonplaceholder.typicode.com";

async function getData() {
  return await http.get(`${BASE_URL}/todos/1`);
}

async function sendJsonData(data) {
  return await http.post(`${BASE_URL}/todos`, {
    json: { ...data },
  });
}

describe("Methods Request", () => {
  const todo = {
    userId: 1,
    id: 1,
    title: "delectus aut autem",
    completed: false,
  };

  it("should fetch data using GET request", async () => {
    const spyGet = jest.spyOn(http, "get");

    (http.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ data: todo })
    );

    const response = await getData();

    expect(spyGet).toHaveBeenCalledWith(BASE_URL + "/todos/1");

    expect(response.data).toEqual(todo);

    spyGet.mockRestore();
  });
  it("should Sending JSON data using POST request", async () => {
    jest.spyOn(http, "post");

    (http.post as jest.Mock).mockResolvedValueOnce({ statusText: "Created" });

    const response = await sendJsonData(todo);

    expect(response.statusText).toBe("Created");
  });
  it("should Sending request with JSON body", async () => {
    const response = await sendJsonData(todo);

    expect(http.post).toHaveBeenLastCalledWith(`${BASE_URL}/todos`, {
      json: todo,
    });
  });
});
