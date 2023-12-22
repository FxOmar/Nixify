require("isomorphic-fetch");
import Reqeza from "../src/index";
import { RequestMethods } from "../src/interfaces";
import { startServer, stopServer } from "../src/utils/testing-server";

const BASE_URL = "http://localhost:3001";

let http: RequestMethods;

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY3Mjc2NjAyOCwiZXhwIjoxNjc0NDk0MDI4fQ.kCak9sLJr74frSRVQp0_27BY4iBCgQSmoT3vQVWKzJg"

describe("API AUTH", () => {
    beforeAll(() => {
        startServer();
    
        http = Reqeza.create({
          PREFIX_URL: { API: BASE_URL },
        });
      });
    
      afterAll(() => {
        stopServer();
      });

  it("Should login /auth/login and return JWT tokens", async () => {
    const { data, status } = await http.post("/auth/login", {
        json:{
            username: "testuser",
            password: "password"
        }
    }).json();

    expect(status).toBe(200);
    expect(data.access_token).toEqual(authToken)
  })

  it("Should Fetch user profile with Authentication token", async () => {
    const { data, status, config } = await http.get("/auth/profile", { headers: {
        authorization: authToken
    }}).json();

    expect(status).toBe(200);
    expect(data.profile.fullName).toEqual("Test User")
  });
})

