import express from "express";
import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
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
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    if (!validatePhone(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Invalid credentials." });

    // Issue JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, type: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful.", token, user });
  } catch (err) {
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
