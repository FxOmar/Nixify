import express from "express";

const app = express();

// Config default options
const config = {
  hostname: "localhost",
  port: 3001,
  logsEnabled: 0,
  pages: {},
};

// const status200 = 200;
// const status404 = 404;

app.use(express.json()); // for parsing application/json

app
  .route("/book")
  .get((req, res) => {
    res.json({ message: "Hello, world" });
  })
  .post((req, res) => {
    res.json({ title: req.body.title, message: "Book added successfully." });
  })
  .put((req, res) => {
    res.send("Update the book");
  });

app.get("/text", (req, res) => {
  res.send("Hello, world");
});

let server;

export function startServer() {
  server = app
    .listen(config.port, () => {
      console.log(
        `Server running at http://${config.hostname}:${config.port}/`
      );
    })
    .on("error", (err) => console.log("Error starting server:", err));
}

export function stopServer() {
  server
    .close()
    .on("error", (err) => console.log("Error stopping server:", err));
}
