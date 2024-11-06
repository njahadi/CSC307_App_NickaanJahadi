import React, { useState } from "react";
import { Link } from "react-router-dom"

function Login(props) {
  const [creds, setCreds] = useState({
    username: "",
    password: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setCreds((prevCreds) => ({ ...prevCreds, [name]: value }));
  }

  function submitForm() {
    props.handleSubmit(creds);
    setCreds({ username: "", password: "" });
  }

  return (
    <div>
      <form>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          name="username"
          id="username"
          value={creds.username}
          onChange={handleChange}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          value={creds.password}
          onChange={handleChange}
        />
        <input
          type="button"
          value={props.buttonLabel || "Log In"}
          onClick={submitForm}
        />
      </form>

      {props.buttonLabel === "Sign Up" ? (
        <p>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      ) : (
        <p>
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      )}

      {props.message && <p>{props.message}</p>}
    </div>
  );
}
export default Login;