import React, { useState, useEffect } from "react";
import Table from "./Table";
import Form from "./Form";
import Login from "./Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function MyApp() {
  const API_PREFIX = "http://localhost:8000";
  const INVALID_TOKEN = "INVALID_TOKEN";
  const [token, setToken] = useState(INVALID_TOKEN);
  const [characters, setCharacters] = useState([]);
  const [message, setMessage] = useState("");

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
        setMessage(`Login successful; auth token saved`);
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
        setMessage(
          `Signup successful for user: ${creds.username}; auth token saved`
        );
      } else {
        setMessage(`Signup Error ${response.status}: ${response.data}`);
      }
    })
    .catch((error) => {
      setMessage(`Signup Error: ${error}`);
    });

  return promise;
}

  return (
    <div className="container">
      <Table characterData={characters} removeCharacter={removeOneCharacter} />
      <Form handleSubmit={updateList} />
      <Router>
        <Routes>
          <Route path="/login" element={<Login handleSubmit={loginUser} />} />
          <Route
            path="/signup"
            element={<Login handleSubmit={signupUser} buttonLabel="Sign Up" />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default MyApp;
