import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userService from "../express-backend/services/user-service.js";
import {
  authenticateUser,
  registerUser,
  loginUser
} from "../express-backend/auth/auth.js";
import AuthUser from "../express-backend/models/authUser.js";

dotenv.config();

const { MONGO_CONNECTION_STRING } = process.env;

mongoose.set("debug", true);
mongoose.connect(MONGO_CONNECTION_STRING).catch((error) => console.log(error));

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

//get list of users
app.get("/users", authenticateUser, (req, res) => {
  const name = req.query.name;
  const job = req.query.job;

  userService
    .getUsers(name, job)
    .then((users) => {
      res.status(200).send({ users_list: users });
    })
    .catch((error) => {
      res.status(500).send("Error fetching users.");
    });
});

//get specific user by id
app.get("/users/:id", authenticateUser, (req, res) => {
  const id = req.params["id"];

  userService
    .findUserById(id)
    .then((user) => {
      if (!user) {
        res.status(404).send("Resource not found");
      } else {
        res.send({ user: user });
      }
    })
    .catch((error) => {
      res.status(500).send("Error fetching user by id.");
    });
});

app.post("/signup", registerUser);

app.post("/login", loginUser);

//add user
app.post("/users", authenticateUser, (req, res) => {
  const userToAdd = req.body;

  userService
    .addUser(userToAdd)
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((error) => {
      res.status(400).send("Failed to add user.");
    });
});

//delete user by ID
app.delete("/users/:id", authenticateUser, (req, res) => {
  const id = req.params["id"];

  userService
    .deleteUser(id)
    .then((user) => {
      if (!user) {
        res.status(404).send("Resource not found.");
      } else {
        res.status(204).send();
      }
    })
    .catch((error) => {
      res.status(500).send("Error deleting user.");
    });
});
