import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Add lastLogin field to schema
const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [200, "Company name cannot exceed 200 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    bannerPicture: String,
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Please enter a valid website URL"],
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [100, "Industry cannot exceed 100 characters"],
    },
    mainLocation: {
      type: String,
      trim: true,
      maxlength: [200, "Main location cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    lastLogin: {
      type: Date,
    },
    // credentialFile: String,
    // credentialStatus: {
    //   type: String,
    //   enum: ["pending", "approved", "rejected"],
    //   default: "pending",
    // },
    // credentialReviewDate: Date,
    // adminNotes: String,
    // ===============================================
    // socialMedia: {
    //   linkedin: {
    //     type: String,
    //     trim: true
    //   },
    //   twitter: {
    //     type: String,
    //     trim: true
    //   },
    //   facebook: {
    //     type: String,
    //     trim: true
    //   },
    //   instagram: {
    //     type: String,
    //     trim: true
    //   }
    // },
  },
  {
    timestamps: true,
  }
);

// Virtual for getting posted jobs count
companySchema.virtual("jobsCount", {
  ref: "Job",
  localField: "_id",
  foreignField: "companyId",
  count: true,
});

// Encrypt password before saving
companySchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
companySchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update last login method
companySchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

export default mongoose.model("Company", companySchema);
