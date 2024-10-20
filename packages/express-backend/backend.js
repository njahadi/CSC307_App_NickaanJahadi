import express from "express";
import cors from "cors";
import userService from "./user-service.js";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(
    `Example app listening at http://localhost:${port}`
  );
});

const users = {
    users_list: [
      {
        id: "xyz789",
        name: "Charlie",
        job: "Janitor"
      },
      {
        id: "abc123",
        name: "Mac",
        job: "Bouncer"
      },
      {
        id: "ppp222",
        name: "Mac",
        job: "Professor"
      },
      {
        id: "yat999",
        name: "Dee",
        job: "Aspring actress"
      },
      {
        id: "zap555",
        name: "Dennis",
        job: "Bartender"
      },
    ]
  };

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//get list of users
app.get("/users", (req, res) => {
  const name = req.query.name;
  const job = req.query.job;

  userService.getUsers(name, job)
  .then(users => {
    res.send({users_list: users});
  })
  .catch((error) => {
    res.status(500).send("Error fetching users.");
  });
});

//get specific user by id
app.get("/users/:id", (req, res) => {
  const id = req.params["id"];

  userService.findUserById(id)
  .then(user => {
    if (!user) {
      res.status(404).send("Resource not found")
    } else {
      res.send(user);
    }
  })
  .catch((error) => {
    res.status(500).send("Error fetching user by id.");
  });
});

//add user
app.post("/users", (req, res) => {
  const userToAdd = req.body;

  userService.addUser(userToAdd)
  .then(user => {
    res.status(201).send(user);
  })
  .catch((error) => {
    res.status(400).send("Failed to add user.");
  });
});

//delete user by ID
app.delete("/users/:id", (req, res) => {
  const id = req.params["id"];

  userService.findUserById(id)
    .then(user => {
      if (!user) {
        res.status(404).send("Resource not found.");
      } else {
        return userModel.deleteOne({ _id: id });
      }
    })
    .then(() => {
      res.status(204).send();
    })
    .catch(err => {
      res.status(500).send("Error deleting user.");
    });
});