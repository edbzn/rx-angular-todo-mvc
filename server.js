const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();

let todos = [
  { id: crypto.randomUUID(), text: "Pay bills", done: true },
  { id: crypto.randomUUID(), text: "Call mom", done: false },
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
  const id = req.params.id;
  console.log("DELETE /todo/" + id);

  const index = todos.findIndex((todo) => todo.id === id);
  todos.splice(index, 1);

  res.status(200).json(todos);
});

app.put("/todo/:id", (req, res) => {
  const id = req.params.id;
  console.log("PUT /todo/" + id);

  const text = req.body.text;
  const done = req.body.done;

  const index = todos.findIndex((todo) => todo.id === id);
  todos[index] = { id, text, done };

  res.status(200).json(todos);
});

app.put("/todo", (req, res) => {
  console.log("PUT /todo");

  todos = req.body;

  res.status(200).json(todos);
});

app.listen(3000, () => {
  console.log("Mock server listening on port 3000");
});
