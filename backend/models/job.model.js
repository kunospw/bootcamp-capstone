import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [200, "Job title cannot exceed 200 characters"],
    },
    major: {
      type: String,
      required: [true, "Job major/field is required"],
      trim: true,
      maxlength: [100, "Major cannot exceed 100 characters"],
    },
    type: {
      type: String,
      required: [true, "Job type is required"],
      enum: ["full-time", "part-time", "contract", "internship", "freelance"],
      default: "full-time",
    },
    workLocation: {
      type: String,
      required: [true, "Work location type is required"],
      enum: ["onsite", "remote", "hybrid"],
      default: "onsite",
    },
    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    salary: {
      min: {
        type: Number,
        min: [0, "Minimum salary cannot be negative"],
      },
      max: {
        type: Number,
        min: [0, "Maximum salary cannot be negative"],
      },
      currency: {
        type: String,
        enum: ["USD", "IDR", "SGD", "MYR", "PHP", "THB"],
        default: "USD",
      },
      period: {
        type: String,
        enum: ["hourly", "monthly", "yearly"],
        default: "monthly",
      },
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    requirements: [
      {
        type: String,
        trim: true,
        required: true,
      },
    ],
    responsibilities: [
      {
        type: String,
        trim: true,
        // required: true,
      },
    ],
    skills: [
      {
        type: String,
        // trim: true,
      },
    ],
    benefits: [
      {
        type: String,
        trim: true,
      },
    ],
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "lead", "executive"],
      required: [true, "Experience level is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      // required: [true, 'Job category is required']
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    datePosted: {
      type: Date,
      default: Date.now,
    },
    applicationDeadline: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    contactEmail: {
      type: String,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    contactPhone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better search performance
jobSchema.index({ title: "text", description: "text", major: "text" });
jobSchema.index({ location: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ workLocation: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ datePosted: -1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ companyId: 1 });
jobSchema.index({ category: 1 });

// Virtual for getting applications
jobSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "jobId",
});

// Method to increment views
jobSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Method to increment applications count
jobSchema.methods.incrementApplications = function () {
  this.applicationsCount += 1;
  return this.save();
};

// Method to check if job is expired
jobSchema.methods.isExpired = function () {
  return this.applicationDeadline && this.applicationDeadline < new Date();
};

// Static method to update all expired jobs to inactive
jobSchema.statics.updateExpiredJobs = async function() {
  const now = new Date();
  const result = await this.updateMany(
    { 
      applicationDeadline: { $lt: now },
      isActive: true 
    },
    { 
      isActive: false 
    }
  );
  return result;
};

// Static method to reactivate jobs with future deadlines
jobSchema.statics.reactivateValidJobs = async function() {
  const now = new Date();
  const result = await this.updateMany(
    { 
      applicationDeadline: { $gt: now },
      isActive: false 
    },
    { 
      isActive: true 
    }
  );
  return result;
};

// Pre-save middleware to validate salary range and handle deadline expiration
jobSchema.pre("save", function (next) {
  // Validate salary range
  if (this.salary.min && this.salary.max && this.salary.min > this.salary.max) {
    next(new Error("Minimum salary cannot be greater than maximum salary"));
  }
  
  // Auto-update isActive based on application deadline
  if (this.applicationDeadline) {
    const now = new Date();
    if (this.applicationDeadline < now) {
      // If deadline has passed, set job as inactive
      this.isActive = false;
    } else if (this.applicationDeadline > now && this.isActive === false) {
      // If deadline is in future and job was inactive due to expiration, reactivate it
      // (This handles cases where deadline is extended)
      this.isActive = true;
    }
  }
  
  next();
});

export default mongoose.model("Job", jobSchema);
