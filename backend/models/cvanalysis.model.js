import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const cvAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // File Information
  originalFilename: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true,
    maxlength: [255, 'Filename cannot exceed 255 characters']
  },
  
  filePath: {
    type: String,
    required: [true, 'File path is required'],
    trim: true
  },
  
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  
  // Extracted Content
  extractedText: {
    type: String,
    required: [true, 'Extracted text is required'],
    maxlength: [50000, 'Extracted text too long']
  },
  
  // Job Context
  jobData: {
    experienceLevel: {
      type: String,
      required: [true, 'Experience level is required'],
      enum: ['entry', 'mid', 'senior', 'executive']
    },
    major: {
      type: String,
      required: [true, 'Major field is required'],
      trim: true,
      maxlength: [100, 'Major cannot exceed 100 characters']
    },
    targetJobDescriptions: [{
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Job title cannot exceed 200 characters']
      },
      company: {
        type: String,
        trim: true,
        maxlength: [200, 'Company name cannot exceed 200 characters']
      },
      description: {
        type: String,
        required: true,
        maxlength: [10000, 'Job description cannot exceed 10000 characters']
      },
      requirements: [{
        type: String,
        trim: true
      }]
    }]
  },
  
  // Analysis Results
  overallScore: {
    type: Number,
    required: [true, 'Overall score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  
  // Summary Analysis
  summary: {
    strengths: {
      type: String,
      trim: true,
      maxlength: [500, 'Strengths summary cannot exceed 500 characters']
    },
    areasOfImprovement: {
      type: String,
      trim: true,
      maxlength: [500, 'Areas of improvement summary cannot exceed 500 characters']
    }
  },
  
  sections: {
    atsCompatibility: {
      score: {
        type: Number,
        required: true,
        min: [0, 'Score cannot be negative'],
        max: [100, 'Score cannot exceed 100']
      },
      issues: [{
        type: String,
        trim: true
      }],
      recommendations: [{
        type: String,
        trim: true
      }],
      details: {
        type: Object,
        default: {}
      }
    },
    
    skillsAlignment: {
      score: {
        type: Number,
        required: true,
        min: [0, 'Score cannot be negative'],
        max: [100, 'Score cannot exceed 100']
      },
      missing: [{
        skill: String,
        importance: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical'],
          default: 'medium'
        }
      }],
      present: [{
        skill: String,
        proficiency: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'intermediate'
        }
      }],
      suggestions: [{
        type: String,
        trim: true
      }]
    },
    
    experienceRelevance: {
      score: {
        type: Number,
        required: true,
        min: [0, 'Score cannot be negative'],
        max: [100, 'Score cannot exceed 100']
      },
      strengths: [{
        type: String,
        trim: true
      }],
      weaknesses: [{
        type: String,
        trim: true
      }],
      careerProgression: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'needs-improvement'],
        default: 'fair'
      }
    },
    
    achievementQuantification: {
      score: {
        type: Number,
        required: true,
        min: [0, 'Score cannot be negative'],
        max: [100, 'Score cannot exceed 100']
      },
      quantifiedAchievements: [{
        type: String,
        trim: true
      }],
      improvements: [{
        section: String,
        suggestion: String,
        example: String
      }]
    },
    
    marketPositioning: {
      score: {
        type: Number,
        required: true,
        min: [0, 'Score cannot be negative'],
        max: [100, 'Score cannot exceed 100']
      },
      competitiveAnalysis: {
        salaryRange: {
          min: Number,
          max: Number,
          currency: {
            type: String,
            enum: ['USD', 'IDR', 'SGD', 'MYR', 'PHP', 'THB'],
            default: 'USD'
          }
        },
        demandLevel: {
          type: String,
          enum: ['very-low', 'low', 'moderate', 'high', 'very-high'],
          default: 'moderate'
        },
        competitionLevel: {
          type: String,
          enum: ['very-low', 'low', 'moderate', 'high', 'very-high'],
          default: 'moderate'
        }
      }
    }
  },
  
  // Recommendations
  recommendations: [{
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical']
    },
    category: {
      type: String,
      required: true,
      enum: ['skills', 'experience', 'format', 'content', 'keywords', 'achievements']
    },
    suggestion: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Suggestion cannot exceed 1000 characters']
    },
    impact: {
      type: String,
      trim: true,
      maxlength: [500, 'Impact description cannot exceed 500 characters']
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    estimatedTimeToImplement: {
      type: String,
      enum: ['immediate', 'hours', 'days', 'weeks'],
      default: 'hours'
    }
  }],
  
  // Job Matching Results
  jobMatching: {
    averageCompatibility: {
      type: Number,
      min: [0, 'Compatibility cannot be negative'],
      max: [100, 'Compatibility cannot exceed 100']
    },
    bestMatches: [{
      jobIndex: Number,
      compatibilityScore: Number,
      matchingSkills: [String],
      missingSkills: [String],
      recommendations: [String]
    }],
    improvementPotential: {
      type: String,
      trim: true
    }
  },
  
  // Market Insights
  marketInsights: {
    salaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        enum: ['USD', 'IDR', 'SGD', 'MYR', 'PHP', 'THB'],
        default: 'USD'
      },
      confidence: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    },
    demandLevel: {
      type: String,
      enum: ['very-low', 'low', 'moderate', 'high', 'very-high'],
      default: 'moderate'
    },
    competitionLevel: {
      type: String,
      enum: ['very-low', 'low', 'moderate', 'high', 'very-high'],
      default: 'moderate'
    },
    growthProjection: {
      type: String,
      enum: ['declining', 'stable', 'growing', 'rapidly-growing'],
      default: 'stable'
    },
    keyTrends: [{
      type: String,
      trim: true
    }]
  },
  
  // Processing Information
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  
  processingStages: [{
    stage: {
      type: String,
      enum: ['upload', 'parsing', 'extraction', 'analysis', 'completion'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'failed'],
      default: 'pending'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    error: String
  }],
  
  // OpenAI Processing Details
  openaiProcessing: {
    model: {
      type: String,
      default: 'gpt-4'
    },
    tokensUsed: {
      type: Number,
      min: [0, 'Tokens used cannot be negative']
    },
    processingTime: {
      type: Number, // in milliseconds
      min: [0, 'Processing time cannot be negative']
    },
    cost: {
      type: Number, // in USD
      min: [0, 'Cost cannot be negative']
    }
  },
  
  // Analytics & Tracking
  analytics: {
    viewCount: {
      type: Number,
      default: 0,
      min: [0, 'View count cannot be negative']
    },
    lastViewed: Date,
    shared: {
      type: Boolean,
      default: false
    },
    downloaded: {
      type: Boolean,
      default: false
    },
    improvementsImplemented: [{
      recommendationId: mongoose.Schema.Types.ObjectId,
      implementedAt: {
        type: Date,
        default: Date.now
      },
      userFeedback: {
        type: String,
        enum: ['helpful', 'somewhat-helpful', 'not-helpful']
      }
    }]
  },
  
  // Version Control
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1']
  },
  
  // Soft Delete
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
cvAnalysisSchema.index({ userId: 1, createdAt: -1 });
cvAnalysisSchema.index({ processingStatus: 1 });
cvAnalysisSchema.index({ overallScore: -1 });
cvAnalysisSchema.index({ 'jobData.experienceLevel': 1 });
cvAnalysisSchema.index({ 'jobData.major': 1 });
cvAnalysisSchema.index({ isActive: 1, createdAt: -1 });

// Virtual for user details
cvAnalysisSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Instance Methods
cvAnalysisSchema.methods.markAsCompleted = function() {
  this.processingStatus = 'completed';
  this.processingStages.forEach(stage => {
    if (stage.status === 'in-progress') {
      stage.status = 'completed';
      stage.endTime = new Date();
    }
  });
  return this.save();
};

cvAnalysisSchema.methods.markAsFailed = function(error) {
  this.processingStatus = 'failed';
  const currentStage = this.processingStages.find(stage => stage.status === 'in-progress');
  if (currentStage) {
    currentStage.status = 'failed';
    currentStage.endTime = new Date();
    currentStage.error = error.message;
  }
  return this.save();
};

cvAnalysisSchema.methods.updateStage = function(stageName, status, error = null) {
  const stage = this.processingStages.find(s => s.stage === stageName);
  if (stage) {
    stage.status = status;
    if (status === 'in-progress') {
      stage.startTime = new Date();
    } else if (status === 'completed' || status === 'failed') {
      stage.endTime = new Date();
      if (error) stage.error = error;
    }
  }
  return this.save();
};

cvAnalysisSchema.methods.incrementViews = function() {
  this.analytics.viewCount += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

cvAnalysisSchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Static Methods
cvAnalysisSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId, isActive: true };
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0)
    .populate(options.populate || '');
};

cvAnalysisSchema.statics.findCompletedAnalyses = function(userId) {
  return this.find({
    userId,
    processingStatus: 'completed',
    isActive: true
  }).sort({ createdAt: -1 });
};

cvAnalysisSchema.statics.getAnalyticsData = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        isActive: true
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          status: "$processingStatus"
        },
        count: { $sum: 1 },
        avgScore: { $avg: "$overallScore" }
      }
    }
  ]);
};

// Pre-save middleware
cvAnalysisSchema.pre('save', function(next) {
  if (this.isNew) {
    // Initialize processing stages
    this.processingStages = [
      { stage: 'upload', status: 'completed', startTime: new Date(), endTime: new Date() },
      { stage: 'parsing', status: 'pending' },
      { stage: 'extraction', status: 'pending' },
      { stage: 'analysis', status: 'pending' },
      { stage: 'completion', status: 'pending' }
    ];
  }
  next();
});

// Post-save middleware for notifications
cvAnalysisSchema.post('save', function(doc) {
  if (doc.processingStatus === 'completed') {
    // Trigger notification service
    // This would integrate with your existing notification system
    console.log(`CV Analysis completed for user ${doc.userId}`);
  }
});

// Add pagination plugin
cvAnalysisSchema.plugin(mongoosePaginate);

export default mongoose.model('CVAnalysis', cvAnalysisSchema);
