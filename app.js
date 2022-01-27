import express from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";
import cors from "cors";


const app = express();
const PORT = 2000;

app.use(cors({origin: true}))
app.use(express.json());

app.use(async (req, res, next) => {
  await sleep();
  next();
})

app
  .route("/todo")
  .get(async (req, res) => {
    fs.readFile("todo.json", (err, data) => {
      if (err) throw err;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(data);
      return res.end();
    });
  })
  .post((req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).send('Bad Request, "name" not provided.');
    const now = Date.now();
    fs.readFile("todo.json", (err, data) => {
      if (err) throw err;
      const todos = JSON.parse(data);
      const todo = {
        id: uuid(),
        name,
        createTime: now,
        updateTime: now,
        isDone: false,
        description,
      };
      todos.push(todo);
      fs.writeFile("todo.json", JSON.stringify(todos), (err) => {
        if (err) throw err;
        console.log(err);
      });
      return res.send(todo);
    });
  });

app
  .route("/todo/:id")
  .put((req, res) => {
    const id = req.params.id;
    const { name, isDone, description } = req.body;
    fs.readFile("todo.json", (err, data) => {
      if (err) throw err;
      const todos = JSON.parse(data);
      const todo = todos.find((td) => td.id == id);
      if (!todo) return res.status(404).send("todo not found!");
      todo.name = name || todo.name;
      todo.isDone = !!isDone;
      todo.updateTime = Date.now();
      todo.description = description || todo.description;
      fs.writeFile("todo.json", JSON.stringify(todos), (err) => {
        if (err) throw err;
        console.log(err);
      });
      return res.send(todo);
    });
  })
  .delete((req, res) => {
    const id = req.params.id;
    fs.readFile("todo.json", (err, data) => {
      if (err) throw err;
      const todos = JSON.parse(data);
      const todoIndex = todos.findIndex((td) => td.id == id);
      if (todoIndex < 0) return res.status(404).send("todo not found!");
      todos.splice(todoIndex, 1);
      fs.writeFile("todo.json", JSON.stringify(todos), (err) => {
        if (err) throw err;
        console.log(err);
      });
      return res.send(`todo (${id}) deleted successfully`);
    });
  });

app.get("/reset", (req, res) => {
  const todos = [
    {
      id: "65dca575-c134-4855-b188-11c0f929aa33",
      name: "example task",
      createTime: 1643094966040,
      updateTime: 1643094966040,
      isDone: false,
      description: "this is an example description.",
    },
  ];
  fs.writeFile("todo.json", JSON.stringify(todos), (err) => {
    if (err) throw err;
    console.log(err);
    console.log('message')
    return res.send(`todo reset successfully`);
  });
});

app.get("/user", (req, res) => {
  fs.readFile("user.json", (err, data) => {
    if (err) throw err;
    const users = JSON.parse(data);
    return res.send(users);
  });
})

app.get("/", (req, res) => {
  res.send(`Welcome to TODO Backend`);
});

app.use("**", (req, res) => {
  res.send("Path not Found");
});

app.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});

async function sleep(time = 1500){
  return new Promise(res => {
    setTimeout(res, time, true);
  })
}