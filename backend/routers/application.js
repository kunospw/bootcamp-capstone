import express from "express";
import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import { authenticateUser, authenticateCompany } from "../middleware/auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  }
});

// Submit application (User only)
router.post("/", authenticateUser, upload.single("resume"), async (req, res) => {
  try {
    const { jobId } = req.body;
    
    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ message: "Job not found or inactive" });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      userId: req.user._id,
      jobId
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied to this job" });
    }

    // Check application deadline
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({ message: "Application deadline has passed" });
    }

    const applicationData = {
      ...req.body,
      userId: req.user._id,
      resume: req.file ? req.file.path : null,
      email: req.user.email
    };

    const application = new Application(applicationData);
    await application.save();

    // Increment job applications count
    await job.incrementApplications();

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's applications
router.get("/my-applications", authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId: req.user._id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate("jobId", "title companyId location type datePosted")
      .populate({
        path: "jobId",
        populate: {
          path: "companyId",
          select: "companyName profilePicture"
        }
      })
      .sort({ applicationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get applications for company's jobs
router.get("/company-applications", authenticateCompany, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, jobId } = req.query;
    
    // Get company's jobs
    const companyJobs = await Job.find({ companyId: req.company._id }).select("_id");
    const jobIds = companyJobs.map(job => job._id);

    const query = { jobId: { $in: jobIds } };
    if (status) query.status = status;
    if (jobId) query.jobId = jobId;

    const applications = await Application.find(query)
      .populate("userId", "fullName email phoneNumber")
      .populate("jobId", "title location type")
      .sort({ applicationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status (Company only)
router.patch("/:id/status", authenticateCompany, async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const application = await Application.findById(req.params.id)
      .populate("jobId");
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if company owns the job
    if (application.jobId.companyId.toString() !== req.company._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await application.updateStatus(status, note, req.company._id);

    res.json({
      message: "Application status updated successfully",
      application
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add company note (Company only)
router.post("/:id/note", authenticateCompany, async (req, res) => {
  try {
    const { note } = req.body;
    
    const application = await Application.findById(req.params.id)
      .populate("jobId");
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if company owns the job
    if (application.jobId.companyId.toString() !== req.company._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await application.addCompanyNote(note, req.company._id);

    res.json({
      message: "Note added successfully",
      application
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get single application details
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("jobId")
      .populate("userId", "-password");
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if user owns the application
    if (application.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
