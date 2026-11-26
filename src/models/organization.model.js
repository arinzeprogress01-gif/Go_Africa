import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  name: { type: String, trim: true, maxlength: 150 },
  organizationType: {
    type: String,
    enum: ["ngo", "government_agency", "climate_startup", "csr_team", "other"],
    default: "other"
  },
  cacNumber: { type: String, trim: true },
  contactPersonName: { type: String, trim: true },
  officeAddress: { type: String, trim: true },
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  verificationNote: { type: String, trim: true },
  isPhoneVerified: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date
}, { timestamps: true });

export const Organization =
  mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);