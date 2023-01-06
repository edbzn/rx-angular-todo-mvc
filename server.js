const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();

const todos = [
  { id: crypto.randomUUID(), text: "Task 1", done: false },
  { id: crypto.randomUUID(), text: "Task 2", done: false },
  { id: crypto.randomUUID(), text: "Task 3", done: false },
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

  const todo = { id: crypto.randomUUID(), text, done: false };
  todos.unshift(todo);

  res.status(201).json(todos);
});

app.delete("/todo/:id", (req, res) => {
  console.log("DELETE /todo");
  const id = req.params.id;

  const index = todos.findIndex((todo) => todo.id === id);
  todos.splice(index, 1);

  res.status(200).json(todos);
});

// endpoint to update a todo
app.put("/todo/:id", (req, res) => {
  console.log("PUT /todo");
  const id = req.params.id;
  const text = req.body.text;
  const done = req.body.done;

  const index = todos.findIndex((todo) => todo.id === id);
  todos[index] = { id, text, done };

  res.status(200).json(todos);
});

app.listen(3000, () => {
  console.log("Mock server listening on port 3000");
});
