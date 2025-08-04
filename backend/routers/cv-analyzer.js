import express from "express";
import cvAnalyzerController from "../controllers/cv-analyzer.controller.js";
import { authenticateUser } from "../middleware/auth.js";
import {
  uploadCV,
  validateCVUploadRequest,
  cleanupOnError,
  rateLimitCVUpload
} from "../middleware/cv-upload.middleware.js";

const router = express.Router();

/**
 * CV Analyzer Routes
 * Base path: /api/v1/cv-analyzer
 */

// Apply authentication middleware to all routes
router.use(authenticateUser);

/**
 * @route   POST /api/v1/cv-analyzer/upload
 * @desc    Upload and analyze CV
 * @access  Private (User)
 * @body    {
 *   cv: File (PDF, max 10MB),
 *   experienceLevel: String (entry|mid|senior|executive),
 *   major: String (2-100 chars),
 *   jobId?: String (optional MongoDB ObjectId)
 * }
 */
router.post(
  "/upload",
  rateLimitCVUpload,
  uploadCV,
  validateCVUploadRequest,
  cvAnalyzerController.uploadAndAnalyzeCV,
  cleanupOnError
);

/**
 * @route   GET /api/v1/cv-analyzer/results/:analysisId
 * @desc    Get analysis results by ID
 * @access  Private (User - own analyses only)
 * @params  analysisId: String (MongoDB ObjectId)
 */
router.get(
  "/results/:analysisId",
  cvAnalyzerController.getAnalysisResults
);

/**
 * @route   GET /api/v1/cv-analyzer/history
 * @desc    Get user's CV analysis history
 * @access  Private (User)
 * @query   {
 *   page?: Number (default: 1),
 *   limit?: Number (default: 10, max: 50),
 *   status?: String (processing|completed|failed)
 * }
 */
router.get(
  "/history",
  cvAnalyzerController.getAnalysisHistory
);

/**
 * @route   POST /api/v1/cv-analyzer/reanalyze/:analysisId
 * @desc    Reanalyze existing CV with new parameters
 * @access  Private (User - own analyses only)
 * @params  analysisId: String (MongoDB ObjectId)
 * @body    {
 *   experienceLevel?: String (entry|mid|senior|executive),
 *   major?: String (2-100 chars),
 *   jobId?: String (MongoDB ObjectId)
 * }
 */
router.post(
  "/reanalyze/:analysisId",
  cvAnalyzerController.reanalyzeCV
);

/**
 * @route   DELETE /api/v1/cv-analyzer/:analysisId
 * @desc    Delete CV analysis and associated file
 * @access  Private (User - own analyses only)
 * @params  analysisId: String (MongoDB ObjectId)
 */
router.delete(
  "/:analysisId",
  cvAnalyzerController.deleteAnalysis
);

/**
 * @route   GET /api/v1/cv-analyzer/analytics
 * @desc    Get user's CV analysis analytics and insights
 * @access  Private (User)
 * @query   {
 *   timeframe?: String (7d|30d|90d|1y, default: 30d)
 * }
 */
router.get(
  "/analytics",
  cvAnalyzerController.getAnalytics
);

/**
 * @route   GET /api/v1/cv-analyzer/health
 * @desc    Health check endpoint for CV Analyzer service
 * @access  Private (User)
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "CV Analyzer service is running",
    timestamp: new Date().toISOString(),
    services: {
      openai: process.env.OPENAI_API_KEY ? "configured" : "not configured",
      storage: "local",
      database: "connected"
    }
  });
});

// Error handling middleware specific to CV analyzer routes
router.use((error, req, res, next) => {
  console.error("CV Analyzer route error:", error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format"
    });
  }
  
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate entry error"
    });
  }
  
  // Generic error response
  res.status(500).json({
    success: false,
    message: "Internal server error in CV Analyzer",
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default router;
