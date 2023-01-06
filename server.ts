const express = require('express');

const app = express();

// mock data for todo items
const todos = [
  { id: 1, text: 'Task 1', done: false },
  { id: 2, text: 'Task 2', done: false },
  { id: 3, text: 'Task 3', done: false },
];

app.get('/todo', (req: any, res: any) => {
  console.log('GET /todos');
  res.set('Access-Control-Allow-Origin', '*');
  res.status(200).json(todos);
});

app.listen(3000, () => {
  console.log('Mock server listening on port 3000');
});
