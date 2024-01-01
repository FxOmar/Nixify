require("isomorphic-fetch");
import Reqeza from "../src/index";
import { startServer } from "../src/utils/testing-server";

const BASE_URL = "http://localhost:3001";

let http;
let server;

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY3Mjc2NjAyOCwiZXhwIjoxNjc0NDk0MDI4fQ.kCak9sLJr74frSRVQp0_27BY4iBCgQSmoT3vQVWKzJg"

describe("API AUTH", () => {
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

  it("Should login /auth/login and return JWT tokens", async () => {
    const { data, status } = await http.post("/auth/login", {
        json:{
            username: "testuser",
            password: "password"
        }
    }).json();

    http.setHeaders({ authorization: data.access_token })
    
    expect(status).toBe(200);
    expect(data.access_token).toEqual(authToken)
  })

  it("Should Fetch user profile with Authentication token", async () => {
    const { data, status, config } = await http.get("/auth/profile").json();

    expect(config.headers.get("authorization")).toEqual(authToken)
    expect(status).toBe(200);
    expect(data.profile.fullName).toEqual("Test User")
  });
})

