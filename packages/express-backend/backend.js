import express from "express";
import cors from "cors";

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

const findUserById = (id) =>
  users["users_list"].find((user) => user["id"] === id);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const findUserByName = (name) => {
  return users["users_list"].filter(
    (user) => user["name"] === name
  );
};

const findUserByNameAndJob = (name, job) => {
  return users["users_list"].filter(
    (user) => (user["name"] === name && user["job"] === job)
  );
};

//get list of users
app.get("/users", (req, res) => {
  const name = req.query.name;
  const job = req.query.job;
  let result = users["users_list"];
  if (name != undefined && job != undefined) {
    result = findUserByNameAndJob(name, job);
  }
  else if (name != undefined) {
    result = findUserByName(name);
  }
  result = { users_list: result };
  res.send(result);
});

//get specific user by id
app.get("/users/:id", (req, res) => {
  const id = req.params["id"]; //or req.params.id
  let result = findUserById(id);
  if (result === undefined) {
    res.status(404).send("Resource not found.");
  } else {
    res.send(result);
  }
});

const deleteUser = (user) => {
  users["users_list"].splice(users["users_list"].indexOf(user), 1);
}

//delete user by id
app.delete("/users/:id", (req, res) => {
  const id = req.params["id"];
  let result = findUserById(id);
  if (result === undefined) {
    res.status(404).send("Resource not found.");
  } else {
    deleteUser(result);
    res.status(204).send();
  }
});

function genRandomID() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  //Generate 3 random letters
  let randomLetters = "";
  for (let i = 0; i < 3; i++) {
    randomLetters += letters[Math.floor(Math.random() * letters.length)];
  }

  // Generate 3 random digits
  let randomDigits = "";
  for (let i = 0; i < 3; i++) {
    randomDigits += numbers[Math.floor(Math.random() * numbers.length)];
  }

  // Combine letters and digits
  return randomLetters + randomDigits;
}

const addUser = (user) => {
  user["id"] = genRandomID();
  users["users_list"].push(user);
  return user;
};

//add user
app.post("/users", (req, res) => {
  const userToAdd = req.body;
  let result = addUser(userToAdd);
  if (result != undefined) {
    res.status(201).send(result);
  } else {
    res.status(400).send("Failed to add user.");
  }
});