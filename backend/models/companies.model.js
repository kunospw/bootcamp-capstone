import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: String,
  password: { type: String, required: true },
  profilePicture: String,
  bannerPicture: String,
  website: String,
  industry: String,
  mainLocation: String,
  description: String,
  credentialFile: String,
  credentialStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  credentialReviewDate: Date,
  adminNotes: String,
});

export default mongoose.model("Company", companySchema);
