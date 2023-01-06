const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

const todos = [
  { id: 1, text: "Task 1", done: false },
  { id: 2, text: "Task 2", done: false },
  { id: 3, text: "Task 3", done: false },
];

app.use(cors());
app.use(bodyParser.json());

app.get("/todo", (req, res) => {
  console.log("GET /todo");
  res.status(200).json(todos);
});

app.post("/todo", (req, res) => {
  console.log("POST /todo");
  const text = req.body.text;
  const todo = { id: todos.length + 1, text, done: false };
  todos.push(todo);
  res.status(201).json(todos);
});

app.listen(3000, () => {
  console.log("Mock server listening on port 3000");
});
