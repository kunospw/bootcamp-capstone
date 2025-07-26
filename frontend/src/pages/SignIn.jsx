import React, { useState } from "react";

export default function Login() {
  const [type, setType] = useState("user");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setForm({ email: "", password: "" });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    let endpoint = type === "user" ? "/auth/login" : "/company/login";
    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setMessage("Login successful!");
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch (err) {
      setMessage("Login failed.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <div>
        <label>
          <input
            type="radio"
            value="user"
            checked={type === "user"}
            onChange={handleTypeChange}
          />
          User
        </label>
        <label style={{ marginLeft: "1em" }}>
          <input
            type="radio"
            value="company"
            checked={type === "company"}
            onChange={handleTypeChange}
          />
          Company
        </label>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}