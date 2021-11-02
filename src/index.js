const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const users = [];

function verifyUserExists(req, res, next)
{
    const { username } = req.headers;

    const user = users.find(user => user.username == username);

    if (!user) {
        return res.status(400).json({ error: 'User not found!'});
    }

    req.user = user;

    return next();
}

function getTodoItem(req, res, next)
{
    const { id } = req.params;
    const { user } = req;

    const todo = user.todos.find(todo => todo.id == id);

    if (!todo) {
        return res.status(404).send({ error: 'Todo não encontrado!'})
    }

    req.todo = todo;

    return next();
}

app.post('/users', (req, res) => {
    const { name, username } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Você deve informar um nome!'});
    }

    if (!username) {
        return res.status(400).json({ error: 'Você deve informar um usuário!'});
    }

    const userExists = users.some(user => user.username == username);

    if (userExists) {
        return res.status(400).json({ error: 'Usuário já existe!'})
    }

    const userData = {
        name,
        username,
        id: uuidv4(),
        todos: []
    };

    users.push(userData);

    return res.status(201).send(userData);
});

app.get('/todos', verifyUserExists, (req, res) => {
    const { user } = req;

    return res.send(user.todos);
});

app.post('/todos', verifyUserExists, (req, res) => {
    const { title, deadline } = req.body;
    const { user } = req;

    const todoData = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    };

    user.todos.push(todoData);

    return res.status(201).send(todoData);
});

app.put('/todos/:id', verifyUserExists, getTodoItem, (req,res) => {
    
    const { title, deadline } = req.body;
    const { todo } = req;

    todo.title = title;
    todo.deadline = deadline;
    
    return res.send(todo);
});

app.patch('/todos/:id/done', verifyUserExists, getTodoItem, (req, res) => {
    const { todo } = req;

    todo.done = true;

    return res.send(todo);
});

app.delete('/todos/:id', verifyUserExists, getTodoItem, (req, res) => {
    const { todo, user } = req;

    user.todos.splice(todo, 1)

    return res.status(204).send(user.todos);
});

module.exports = app;