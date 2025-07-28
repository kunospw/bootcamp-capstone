import express from "express";
import Company from "../models/companies.model.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^\d{8,15}$/.test(phone);
}

// Register (with credential file)
router.post("/register", upload.single("credentialFile"), async (req, res) => {
  try {
    const { companyName, email, password, phoneNumber } = req.body;
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    if (!validatePhone(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const company = new Company({
      companyName,
      email,
      password: hashedPassword,
      phoneNumber,
      credentialFile: req.file ? req.file.path : undefined,
      credentialStatus: "pending",
    });
    await company.save();
    res.status(201).json({ message: "Company registered successfully." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ email });
    if (!company)
      return res.status(401).json({ message: "Invalid credentials." });
    const valid = await bcrypt.compare(password, company.password);
    if (!valid)
      return res.status(401).json({ message: "Invalid credentials." });

    // Issue JWT for company
    const token = jwt.sign(
      { companyId: company._id, email: company.email, type: "company" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful.", token, company });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.post("/validate/:id", async (req, res) => {
  const adminToken = process.env.ADMIN_TOKEN;
  if (req.headers.authorization !== `Bearer ${adminToken}`) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const { status, adminNotes } = req.body; // status: "approved" or "rejected"
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      {
        credentialStatus: status,
        credentialReviewDate: new Date(),
        adminNotes: adminNotes || "",
      },
      { new: true }
    );
    if (!company)
      return res.status(404).json({ message: "Company not found." });
    res.json({ message: `Company credential ${status}.`, company });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
