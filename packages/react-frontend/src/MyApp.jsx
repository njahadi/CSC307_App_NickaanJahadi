import React, { useState, useEffect } from "react";
import Table from "./Table";
import Form from "./Form";
import Login from "./Login";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

function MyApp() {
  const API_PREFIX = "http://localhost:8000";
  const INVALID_TOKEN = "INVALID_TOKEN";
  const [token, setToken] = useState(
    localStorage.getItem("authToken") || INVALID_TOKEN
  );
  const [characters, setCharacters] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    //save token to localStorage whenever it updates
    if (token && token !== INVALID_TOKEN) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  function addAuthHeader(otherHeaders = {}) {
    return token === INVALID_TOKEN
      ? otherHeaders
      : { ...otherHeaders, Authorization: `Bearer ${token}` };
  }

  function removeOneCharacter(index) {
    const deletedUser = characters[index];
    const id = deletedUser["_id"];

    fetch(`${API_PREFIX}/users/${id}`, {
      method: "DELETE",
      headers: addAuthHeader()
    })
      .then((res) => {
        if (res.status === 204) {
          setCharacters((prevCharacters) => prevCharacters.filter((_, i) => i !== index));
        } else {
          console.log(`Expected status 204, instead got ${res.status}`);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function fetchUsers() {
    const promise = fetch(`${API_PREFIX}/users`, {
      headers: addAuthHeader()
    });

    return promise;
  }

  useEffect(() => {
    if (token !== INVALID_TOKEN) {
      fetchUsers()
        .then((res) => (res.status === 200 ? res.json() : undefined))
        .then((json) => setCharacters(json ? json["users_list"] : null))
        .catch((error) => {
          console.log(error);
        });
    }

  }, [token]);

  function postUser(person) {
    const promise = fetch(`${API_PREFIX}/users`, {
      method: "POST",
      headers: addAuthHeader({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(person)
    });

    return promise;
  }

  function updateList(person) {
    postUser(person)
      .then((res) => {
        if (res.status === 201) {
          return res.json();
        } else {
          console.log(`Expected status 201, instead got ${res.status}`);
        }
      })
      .then((json) => setCharacters([...characters, json]))
      .catch((error) => {
        console.log(error);
      });
  }

  function loginUser(creds) {
    const promise = fetch(`${API_PREFIX}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(creds)
    })
      .then((response) => {
        if (response.status === 200) {
          response.json().then((payload) => setToken(payload.token));
          setMessage("Login successful");
        } else if (response.status === 401) {
          setMessage("Incorrect username or password");
        } else {
          setMessage(`Login Error ${response.status}: ${response.data}`);
        }
      })
      .catch((error) => {
        setMessage(`Login Error: ${error}`);
      });

    return promise;
  }

  function signupUser(creds) {
    const promise = fetch(`${API_PREFIX}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(creds)
    })
      .then((response) => {
        if (response.status === 201) {
          response.json().then((payload) => setToken(payload.token));
          setMessage("Signup successful");
        } else if (response.status === 409) {
          setMessage("Username is already taken.");
        } else {
          setMessage(`Signup Error ${response.status}: ${response.data}`);
        }
      })
      .catch((error) => {
        setMessage(`Signup Error: ${error}`);
      });

    return promise;
  }

  function logoutUser() {
    setToken(INVALID_TOKEN);
    setMessage("You have been logged out.");
  }
  
  return (
    <div className="container">
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              token === INVALID_TOKEN ? (
                <Login handleSubmit={loginUser} message={message} />
              ) : (
                <Navigate to="/users" replace />
              )
            }
          />
          <Route
            path="/signup"
            element={
              token === INVALID_TOKEN ? (
                <Login
                  handleSubmit={signupUser}
                  buttonLabel="Sign Up"
                  message={message}
                />
              ) : (
                <Navigate to="/users" replace />
              )
            }
          />
          <Route
            path="/users"
            element={
              token === INVALID_TOKEN ? (
                <Navigate to="/login" replace />
              ) : (
                <>
                  <Table
                    characterData={characters}
                    removeCharacter={removeOneCharacter}
                  />
                  <Form handleSubmit={updateList} />
                  <button onClick={logoutUser}>Sign Out</button>
                </>
              )
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default MyApp;
