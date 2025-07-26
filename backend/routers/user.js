import express from "express";
import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Register
router.post("/register", async(req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({...req.body, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login
router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials." });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            return res.status(401).json({ message: "Invalid credentials." });

        // Issue JWT
        const token = jwt.sign({ userId: user._id, email: user.email, type: "user" },
            process.env.JWT_SECRET, { expiresIn: "1d" }
        );

        res.json({ message: "Login successful.", token, user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;