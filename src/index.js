const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  var { username } = request.headers;

  var foundUsername = users.find((user) => user.username === username);

  if (!foundUsername) {
    return response.status(404).json({ error: "Username don't found" });
  }

  request.user = foundUsername;

  return next();
}

app.post("/users", (request, response) => {
  var { name, username } = request.body;

  if (!name || !username) {
    return response.status(400).json({ error: "User or username are empty" });
  }

  var userExists = users.find((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  var { username } = request.headers;

  var foundUsername = users.find((user) => user.username === username);

  return response.status(200).send(foundUsername.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  var { username } = request.headers;

  var { title, deadline } = request.body;

  var foundUsername = users.find((user) => user.username === username);

  if (!title || !deadline) {
    return response.status(400).json({ error: "Title or deadline are empty" });
  }

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  foundUsername.todos.push(newTodo);

  return response.status(201).send(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  var { title, deadline } = request.body;

  if (!title || !deadline) {
    return response.status(400).json({ error: "Title or deadline are empty" });
  }

  var { id } = request.params;

  var foundTodo = user.todos.find((todo) => todo.id === id);

  if (foundTodo != undefined) {
    foundTodo.title = title;
    foundTodo.deadline = new Date(deadline);

    return response.status(200).send(foundTodo);
  }

  return response.status(404).json({ error: "Todo don't exists" });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  var { id } = request.params;

  var foundTodo = user.todos.find((todo) => todo.id === id);

  if (foundTodo != undefined) {
    foundTodo.done = true;

    return response.status(200).send(foundTodo);
  }

  return response.status(404).json({ error: "Todo don't exists" });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  var { id } = request.params;

  var foundTodo = user.todos.findIndex((todo) => todo.id === id);

  if (foundTodo === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(foundTodo, 1);

  return response.status(204).json();
});

module.exports = app;
