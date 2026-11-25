import mongoose from "mongoose";
import { Otp } from "../models/otp.model.js";

// In-memory fallback is for local demo only when MongoDB is not configured.
const memory = new Map();

export const otpRepository = {
  async save(phone, record) {
    if (mongoose.connection.readyState === 1) {
      return Otp.findOneAndUpdate(
        { phone },
        { $set: { phone, ...record } },
        { upsert: true, new: true, runValidators: true }
      );
    }

    memory.set(phone, { phone, ...record });
  },

  async findByPhone(phone) {
    if (mongoose.connection.readyState === 1) {
      return Otp.findOne({ phone }).lean();
    }

    return memory.get(phone) || null;
  },

  async delete(phone) {
    if (mongoose.connection.readyState === 1) {
      await Otp.deleteOne({ phone });
      return;
    }

    memory.delete(phone);
  }
};