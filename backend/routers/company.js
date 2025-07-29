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

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = (req.header("Authorization") || "").replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.company = decoded; // or req.user depending on your use case
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

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

    // DON'T hash here - let the pre-save hook handle it
    const company = new Company({
      companyName,
      email,
      password, // Raw password - will be hashed by pre-save hook
      phoneNumber,
      // credentialFile: req.file ? req.file.path : undefined,
      // credentialStatus: "pending",
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

    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Make sure to select password field
    const company = await Company.findOne({ email }).select("+password");
    if (!company) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check if password exists on company object
    if (!company.password) {
      return res
        .status(500)
        .json({ message: "Password not found in database." });
    }

    // Use the model method instead of direct bcrypt
    const valid = await company.matchPassword(password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Update last login
    await company.updateLastLogin();

    // Issue JWT for company
    const token = jwt.sign(
      { companyId: company._id, email: company.email, type: "company" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful.",
      token,
      company: {
        _id: company._id,
        companyName: company.companyName,
        email: company.email,
      },
    });
  } catch (err) {
    console.error("Company login error:", err);
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

// Get company profile
router.get("/profile/:id", verifyToken, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select("-password");
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }
    res.json(company);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update company profile
router.put(
  "/profile/:id",
  verifyToken,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "bannerPicture", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const updateData = { ...req.body };

      // Handle file uploads
      if (req.files) {
        if (req.files.profilePicture) {
          updateData.profilePicture = req.files.profilePicture[0].path;
        }
        if (req.files.bannerPicture) {
          updateData.bannerPicture = req.files.bannerPicture[0].path;
        }
      }

      const company = await Company.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).select("-password");

      if (!company) {
        return res.status(404).json({ message: "Company not found." });
      }

      res.json({ message: "Profile updated successfully.", company });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

export default router;
