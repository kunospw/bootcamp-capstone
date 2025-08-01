import express from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import passport from "../config/passport.js";

const router = express.Router();

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^\d{8,15}$/.test(phone);
}

// Register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required." });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    
    if (phoneNumber && !validatePhone(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format." });
    }
    
    // Check if password is at least 3 characters
    if (password.length < 3) {
      return res.status(400).json({ message: "Password must be at least 3 characters long." });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists." });
    }
    
    console.log("Registering user:", email);
    console.log("Password received:", password);
    
    const user = new User({ 
      fullName,
      email,
      password: password, // Store password as plain text
      phoneNumber: phoneNumber || undefined
    });
    
    await user.save();
    console.log("User saved successfully:", email);
    
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Registration error:", err);
    if (err.code === 11000) {
      res.status(409).json({ message: "User with this email already exists." });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    
    console.log("Login attempt for email:", email);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(401).json({ message: "Invalid credentials." });
    }
    
    console.log("User found:", user.email);
    console.log("User password:", user.password);
    console.log("Password from request:", password);
    
    // Simple password comparison (plain text)
    if (user.password !== password) {
      console.log("Password comparison failed");
      return res.status(401).json({ message: "Invalid credentials." });
    }

    console.log("Login successful for:", email);

    // Issue JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, type: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ 
      message: "Login successful.", 
      token, 
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        type: "user"
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ message: err.message });
  }
});

// Google OAuth start
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/signin",
  }),
  (req, res) => {
    // You can issue a JWT here if you want
    // Example:
    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email, type: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    // Redirect to frontend with token (or set cookie)
    res.redirect(`http://localhost:5173/signin?token=${token}`);
  }
);

export default router;
