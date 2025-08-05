import CVAnalysis from "../models/cvanalysis.model.js";
import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import OpenAIService from "../services/openai.service.js";
import PDFParserService from "../services/pdf-parser.service.js";
import fs from "fs/promises";
import path from "path";

/**
 * CV Analyzer Controller
 * Handles all CV analysis operations including upload, analysis, and results management
 */
class CVAnalyzerController {
  constructor() {
    this.openAIService = new OpenAIService();
    this.pdfParserService = new PDFParserService();
  }

  /**
   * Upload and analyze CV
   * POST /api/v1/cv-analyzer/upload
   */
  uploadAndAnalyzeCV = async (req, res) => {
    try {
      const { experienceLevel, major, jobId } = req.body;
      const userId = req.user._id;
      
      // Validate required fields
      if (!experienceLevel || !major) {
        return res.status(400).json({
          success: false,
          message: "Experience level and major are required"
        });
      }

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No CV file uploaded"
        });
      }

      // Extract text from PDF
      const extractedText = await this.pdfParserService.extractText(req.file.path);
      
      // Get job data if jobId is provided
      let jobData = {
        experienceLevel,
        major
      };

      if (jobId) {
        const job = await Job.findById(jobId);
        if (job) {
          jobData.jobTitle = job.title;
          jobData.jobDescription = job.description;
          jobData.requirements = job.requirements;
        }
      }

      // Create initial analysis record
      const analysis = new CVAnalysis({
        userId,
        originalFilename: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        extractedText,
        jobData,
        processingStatus: 'processing'
      });

      await analysis.save();

      // Start async analysis
      this.performAnalysis(analysis._id).catch(error => {
        console.error(`Analysis failed for ${analysis._id}:`, error);
        this.markAnalysisAsFailed(analysis._id, error.message);
      });

      res.status(202).json({
        success: true,
        message: "CV uploaded successfully. Analysis is in progress.",
        data: {
          analysisId: analysis._id,
          status: analysis.processingStatus,
          estimatedCompletionTime: "2-3 minutes"
        }
      });

    } catch (error) {
      console.error("CV upload error:", error);
      
      // Clean up uploaded file if exists
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error("File cleanup error:", cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to upload and analyze CV",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  /**
   * Get analysis results
   * GET /api/v1/cv-analyzer/results/:analysisId
   */
  getAnalysisResults = async (req, res) => {
    try {
      const { analysisId } = req.params;
      const userId = req.user._id;

      const analysis = await CVAnalysis.findOne({
        _id: analysisId,
        userId
      }).populate('userId', 'fullName email');

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: "Analysis not found"
        });
      }

      res.json({
        success: true,
        data: analysis
      });

    } catch (error) {
      console.error("Get results error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve analysis results",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  /**
   * Get user's analysis history
   * GET /api/v1/cv-analyzer/history
   */
  getAnalysisHistory = async (req, res) => {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10, status } = req.query;

      const query = { userId };
      if (status) {
        query.status = status;
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        select: '-extractedText -aiAnalysis.rawResponse'
      };

      const analyses = await CVAnalysis.paginate(query, options);

      res.json({
        success: true,
        data: analyses
      });

    } catch (error) {
      console.error("Get history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve analysis history",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  /**
   * Reanalyze existing CV
   * POST /api/v1/cv-analyzer/reanalyze/:analysisId
   */
  reanalyzeCV = async (req, res) => {
    try {
      const { analysisId } = req.params;
      const { experienceLevel, major, jobId } = req.body;
      const userId = req.user._id;

      const analysis = await CVAnalysis.findOne({
        _id: analysisId,
        userId
      });

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: "Analysis not found"
        });
      }

      // Update job data if provided
      if (experienceLevel || major || jobId) {
        let jobData = { ...analysis.jobData };
        
        if (experienceLevel) jobData.experienceLevel = experienceLevel;
        if (major) jobData.major = major;
        
        if (jobId) {
          const job = await Job.findById(jobId);
          if (job) {
            jobData.jobTitle = job.title;
            jobData.jobDescription = job.description;
            jobData.requirements = job.requirements;
          }
        }
        
        analysis.jobData = jobData;
      }

      // Reset analysis status and clear previous results
      analysis.status = 'processing';
      analysis.aiAnalysis = undefined;
      analysis.recommendations = undefined;
      analysis.skillsAnalysis = undefined;
      analysis.matchingScore = undefined;
      analysis.analysisMetadata.processingStartedAt = new Date();
      analysis.analysisMetadata.reanalyzedAt = new Date();

      await analysis.save();

      // Start async reanalysis
      this.performAnalysis(analysis._id).catch(error => {
        console.error(`Reanalysis failed for ${analysis._id}:`, error);
        this.markAnalysisAsFailed(analysis._id, error.message);
      });

      res.json({
        success: true,
        message: "CV reanalysis started successfully",
        data: {
          analysisId: analysis._id,
          status: analysis.status
        }
      });

    } catch (error) {
      console.error("Reanalyze error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reanalyze CV",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  /**
   * Delete analysis
   * DELETE /api/v1/cv-analyzer/:analysisId
   */
  deleteAnalysis = async (req, res) => {
    try {
      const { analysisId } = req.params;
      const userId = req.user._id;

      const analysis = await CVAnalysis.findOne({
        _id: analysisId,
        userId
      });

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: "Analysis not found"
        });
      }

      // Delete associated file
      try {
        await fs.unlink(analysis.filePath);
      } catch (fileError) {
        console.warn(`Failed to delete file ${analysis.filePath}:`, fileError.message);
      }

      // Delete analysis record
      await CVAnalysis.findByIdAndDelete(analysisId);

      res.json({
        success: true,
        message: "Analysis deleted successfully"
      });

    } catch (error) {
      console.error("Delete analysis error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete analysis",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  /**
   * Get analytics and insights
   * GET /api/v1/cv-analyzer/analytics
   */
  getAnalytics = async (req, res) => {
    try {
      const userId = req.user._id;
      const { timeframe = '30d' } = req.query;

      const analytics = await CVAnalysis.getAnalytics(userId, timeframe);

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve analytics",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  /**
   * Perform AI analysis (async)
   * @private
   */
  async performAnalysis(analysisId) {
    try {
      const analysis = await CVAnalysis.findById(analysisId);
      if (!analysis) {
        throw new Error("Analysis record not found");
      }

      // Perform OpenAI analysis
      const aiResult = await this.openAIService.analyzeCV(
        analysis.extractedText,
        analysis.jobData
      );

      // Update analysis with results
      analysis.status = 'completed';
      analysis.overallScore = aiResult.analysis.overallScore;
      analysis.summary = aiResult.analysis.summary;
      analysis.sections = aiResult.analysis.sections;
      analysis.recommendations = aiResult.recommendations;
      analysis.jobMatching = aiResult.jobMatching;
      analysis.marketInsights = aiResult.marketInsights;
      analysis.openaiProcessing = aiResult.openaiProcessing;
      analysis.processingStatus = 'completed';

      await analysis.save();

      console.log(`Analysis completed successfully for ${analysisId}`);

    } catch (error) {
      console.error(`Analysis failed for ${analysisId}:`, error);
      await this.markAnalysisAsFailed(analysisId, error.message);
      throw error;
    }
  }

  /**
   * Mark analysis as failed
   * @private
   */
  async markAnalysisAsFailed(analysisId, errorMessage) {
    try {
      await CVAnalysis.findByIdAndUpdate(analysisId, {
        status: 'failed',
        'analysisMetadata.failedAt': new Date(),
        'analysisMetadata.errorMessage': errorMessage
      });
    } catch (updateError) {
      console.error(`Failed to update analysis status for ${analysisId}:`, updateError);
    }
  }
}

export default new CVAnalyzerController();
