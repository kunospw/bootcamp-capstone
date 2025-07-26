import React, { useState } from "react";

export default function SignUp() {
  const [type, setType] = useState("user"); // "user" or "company"
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    companyName: "",
  });
  const [credentialFile, setCredentialFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setForm({
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
      companyName: "",
    });
    setCredentialFile(null);
    setMessage("");
  };

  const handleFileChange = (e) => {
    setCredentialFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    let endpoint = type === "user" ? "/auth/register" : "/company/register";

    if (type === "company") {
      const formData = new FormData();
      formData.append("companyName", form.companyName);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("phoneNumber", form.phoneNumber);
      if (credentialFile) {
        formData.append("credentialFile", credentialFile);
      }
      try {
        const res = await fetch(`http://localhost:3000${endpoint}`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const data = await res.json();
        setMessage(data.message);
      } catch (err) {
        setMessage("Registration failed.");
      }
    } else {
      // User registration
      try {
        const res = await fetch(`http://localhost:3000${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            phoneNumber: form.phoneNumber,
          }),
          credentials: "include",
        });
        const data = await res.json();
        setMessage(data.message);
      } catch (err) {
        setMessage("Registration failed.");
      }
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
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
        {type === "user" ? (
          <>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={handleChange}
              required
            />
          </>
        ) : (
          <>
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={form.companyName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={handleChange}
              required
            />
            <input
              type="file"
              name="credentialFile"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              required
            />
          </>
        )}
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
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}