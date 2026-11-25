import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        phone: { type: String, required: true, unique: true, index: true },
        otpHash: { type: String, required: true },
        accountType: {
            type: String,
            enum: ["worker", "organization"],
            required: true
        },
        workerType: {
            type: String,
            enum: ["job_seeker", "volunteer", null],
            default: null
        },
        expiresAt: { type: Date, required: true, index: { expires: 0 } },
        attempts: { type: Number, default: 0 },
        lastSentAt: { type: Date, required: true }
    },
    { timestamps: true }
);

export const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);