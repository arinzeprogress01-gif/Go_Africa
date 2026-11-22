import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, trim: true, maxlength: 100 },
  workerType: { type: String, enum: ["job_seeker", "volunteer"], required: true },
  lga: { type: String, trim: true },
  taskInterests: [{ type: String, trim: true }],
  isPhoneVerified: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date
}, { timestamps: true });

export const Worker = mongoose.models.Worker || mongoose.model("Worker", workerSchema);
