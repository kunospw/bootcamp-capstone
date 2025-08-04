import express from "express";
import SavedJob from "../models/savedjob.model.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Test route to verify router is working
router.get("/test", (req, res) => {
    res.json({ message: "Saved jobs router is working!" });
});

// Save a job
router.post("/", authenticateUser, async(req, res) => {
    try {
        const { jobId, note, priority, tags } = req.body;
        const userId = req.user._id;

        console.log('Saving job:', { jobId, userId, note, priority, tags }); // Debug log

        // Check if job is already saved by this user
        const existingSave = await SavedJob.findOne({ userId, jobId });
        if (existingSave) {
            return res.status(409).json({
                message: "Job is already saved",
                savedJob: existingSave
            });
        }

        const savedJob = new SavedJob({
            userId,
            jobId,
            note: note || '',
            priority: priority || 'medium',
            tags: tags || []
        });

        await savedJob.save();
        await savedJob.populate('jobId');

        console.log('Job saved successfully:', savedJob); // Debug log

        res.status(201).json({
            message: "Job saved successfully",
            savedJob
        });
    } catch (error) {
        console.error('Error saving job:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all saved jobs for a user
router.get("/", authenticateUser, async(req, res) => {
    try {
        const userId = req.user._id;
        const { priority, tags, page = 1, limit = 10 } = req.query;

        console.log('Fetching saved jobs for user:', userId); // Debug log

        const filters = { priority, tags: tags ? tags.split(',') : undefined };

        const savedJobs = await SavedJob.getSavedJobsByUser(userId, filters)
            .populate({
                path: 'jobId',
                populate: {
                    path: 'companyId',
                    select: 'companyName profilePicture'
                }
            })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await SavedJob.countDocuments({ userId, isActive: true });

        console.log('Found saved jobs:', savedJobs.length); // Debug log

        res.json({
            savedJobs,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Error fetching saved jobs:', error);
        res.status(500).json({ message: error.message });
    }
});

// Check if a job is saved
router.get("/check/:jobId", authenticateUser, async(req, res) => {
    try {
        const userId = req.user._id;
        const { jobId } = req.params;

        console.log('Checking if job is saved:', { userId, jobId }); // Debug log

        const savedJob = await SavedJob.findOne({ userId, jobId, isActive: true })
            .populate('jobId');

        console.log('Saved job check result:', { isSaved: !!savedJob }); // Debug log

        res.json({
            isSaved: !!savedJob,
            savedJob: savedJob || null
        });
    } catch (error) {
        console.error('Error checking saved job:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update a saved job
router.put("/:id", authenticateUser, async(req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { note, priority, tags } = req.body;

        console.log('Updating saved job:', { id, userId, note, priority, tags }); // Debug log

        const savedJob = await SavedJob.findOne({ _id: id, userId });
        if (!savedJob) {
            return res.status(404).json({ message: "Saved job not found" });
        }

        savedJob.note = note !== undefined ? note : savedJob.note;
        savedJob.priority = priority || savedJob.priority;
        savedJob.tags = tags !== undefined ? tags : savedJob.tags;

        await savedJob.save();
        await savedJob.populate({
            path: 'jobId',
            populate: {
                path: 'companyId',
                select: 'companyName profilePicture'
            }
        });

        console.log('Saved job updated:', savedJob); // Debug log

        res.json({
            message: "Saved job updated successfully",
            savedJob
        });
    } catch (error) {
        console.error('Error updating saved job:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete a saved job
router.delete("/:id", authenticateUser, async(req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        console.log('Deleting saved job:', { id, userId }); // Debug log

        const savedJob = await SavedJob.findOneAndDelete({ _id: id, userId });
        if (!savedJob) {
            return res.status(404).json({ message: "Saved job not found" });
        }

        console.log('Saved job deleted successfully'); // Debug log

        res.json({ message: "Job removed from saved list successfully" });
    } catch (error) {
        console.error('Error removing saved job:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get saved job by ID
router.get("/:id", authenticateUser, async(req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        console.log('Fetching saved job by ID:', { id, userId }); // Debug log

        const savedJob = await SavedJob.findOne({ _id: id, userId })
            .populate({
                path: 'jobId',
                populate: {
                    path: 'companyId',
                    select: 'companyName profilePicture'
                }
            });

        if (!savedJob) {
            return res.status(404).json({ message: "Saved job not found" });
        }

        console.log('Saved job found:', savedJob); // Debug log

        res.json(savedJob);
    } catch (error) {
        console.error('Error fetching saved job:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;