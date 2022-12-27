const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((users) => users.username === username);
  if (!user) {
    return response.status(404).json({
      error: "User not found!",
    });
  }

  request.user = user;
  return next();
}

function verifyIfUsernameAlreadyExists(request, response, next) {
  const req = request.body;
  const usernameVerify = users.find((users) => users.username === req.username);
  if (usernameVerify) {
    return response.status(400).json({
      error: "Username already exists!",
    });
  }

  request = req;
  return next();
}

function checksExistsTodo(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((users) => users.username === username);
  const todo = user.todos.find((todos) => todos.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Todo not found!",
    });
  }

  request.todo = todo;
  return next();
}

app.post("/users", verifyIfUsernameAlreadyExists, (request, response) => {
  const { name, username } = request.body;
  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };
  users.push(user);

  return response.json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);
  return response.status(201).send(todo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { todo } = request;
    const { title, deadline } = request.body;
    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.status(200).send(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { todo } = request;

    todo.done = true;

    return response.status(200).send(todo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const todoIndex = user.todos.findIndex((todos) => todos.id === id);
    user.todos.splice(todoIndex, 1);

    return response.status(204).send();
  }
);

module.exports = app;
