import express from "express";

const app = express();

// Config default options
const config = {
  hostname: "localhost",
  port: 3001,
};

// const status200 = 200;
// const status404 = 404;

app.use(express.json()); // for parsing application/json
app.use(express.json()); // Middleware to parse JSON requests
app.use(express.urlencoded({ extended: true })); // Use body-parser middleware to parse URL-encoded bodies

app
  .route("/book")
  .get((req, res) => {
    if (req.query.name) {
      res.json({ message: req.query.name });
      return;
    }

    res.json({ message: "Hello, world" });
  })
  .post((req, res) => {
    res
      .status(200)
      .json({ title: req.body.title, message: "Book added successfully." });
  })
  .put((req, res) => {
    res.send("Update the book");
  });

app.get("/text", (req, res) => {
  res.send("Hello, world");
});

const authTokens = {};

// In-memory user database (for testing purposes)
const users = [
  {
    id: 1,
    username: "testuser",
    email: "testuser@example.com",
    fullName: "Test User",
    password: "password", // In a real-world scenario, use a secure password hashing mechanism
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Authentication endpoint
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  // Find the user in the database
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Simulate generating and returning an authentication token
    const authToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY3Mjc2NjAyOCwiZXhwIjoxNjc0NDk0MDI4fQ.kCak9sLJr74frSRVQp0_27BY4iBCgQSmoT3vQVWKzJg";
    authTokens[authToken] = user.id; // Store the user ID associated with the token
    res.json({ success: true, access_token: authToken });
  } else {
    res
      .status(401)
      .json({ success: false, message: "Invalid username or password" });
  }
});

// Profile endpoint (requires authentication)
app.get("/auth/profile", (req, res) => {
  const authToken = req.headers.authorization;

  if (!authToken || !authTokens[authToken]) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: Missing or invalid token",
    });
  } else {
    const userId = authTokens[authToken];
    const userProfile = users.find((u) => u.id === userId);
    res.json({ success: true, profile: userProfile });
  }
});

export function startServer() {
  return app.listen(config.port, () => {
    console.log(`Server running at http://${config.hostname}:${config.port}/`);
  });
}

// export function stopServer() {
//   server
//     .close()
//     .on("error", (err) => console.log("Error stopping server:", err));
// }
