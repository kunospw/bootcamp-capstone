import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: String,
  password: { type: String, required: true },
  profilePicture: String,
  bio: String,
  birthDate: Date,
  gender: String,
  domicile: String,
  personalSummary: String,
});

export default mongoose.model("User", userSchema);
