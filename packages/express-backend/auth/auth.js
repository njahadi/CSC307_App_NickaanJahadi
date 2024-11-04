import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AuthUser from "../models/authUser.js";

function generateAccessToken(username) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { username: username },
      process.env.TOKEN_SECRET,
      { expiresIn: "1d" },
      (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      }
    );
  });
}

export function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  //Getting the 2nd part of the auth header (the token)
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token received");
    res.status(401).end();
  } else {
    jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
      if (decoded) {
        next();
      } else {
        console.log("JWT error:", error);
        res.status(401).end();
      }
    });
  }
}

export function registerUser(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).send("Bad request: Invalid input data.");
  }

  AuthUser.findOne({ username }).then((existingUser) => {
    if (existingUser) {
      return res.status(409).send("Username already taken");
    } else {
      bcrypt
        .genSalt(10)
        .then((salt) => bcrypt.hash(password, salt))
        .then((password) => {
          const newUser = new AuthUser({ username, password });
          newUser.save().then(() => {
            generateAccessToken(username).then((token) => {
              res.status(201).send({ token });
            });
          });
        })
        .catch((error) => res.status(500).send("Error creating user"));
    }
  });
}

export function loginUser(req, res) {
  const { username, password } = req.body;

  AuthUser.findOne({ username }).then((user) => {
    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    bcrypt.compare(password, user.password).then((matched) => {
      if (matched) {
        generateAccessToken(username).then((token) => {
          res.status(200).send({ token });
        });
      } else {
        res.status(401).send("Unauthorized");
      }
    });
  });
}
