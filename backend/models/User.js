import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^\+?[1-9]\d{7,14}$/, "Invalid phone number"],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["candidate", "employer", "admin"],
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    profile: {
      bio: { type: String },
      skills: [{ type: String }],
      resume: { type: String }, // URL to Cloudinary/S3
      resumeOriginalName: { type: String },
      company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
      profilePhoto: { type: String, default: "" },
      savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
      jobAlerts: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
