
import mongoose from "mongoose";
import { Worker } from "../models/worker.model.js";
import { Organization } from "../models/organization.model.js";

// In-memory fallback keeps the API runnable before MongoDB is configured.
const memory = {
  workers: new Map(),
  organizations: new Map()
};

export const userRepository = {
  async findByPhone(phone, accountType) {
    if (mongoose.connection.readyState === 1) {
      return accountType === "organization"
        ? Organization.findOne({ phone })
        : Worker.findOne({ phone });
    }

    const bucket =
      accountType === "organization"
        ? memory.organizations
        : memory.workers;

    return bucket.get(phone) || null;
  },

  async createOrUpdateVerifiedUser({ phone, accountType, workerType }) {
    const now = new Date();


    if (mongoose.connection.readyState === 1) {
      const Model =
        accountType === "organization" ? Organization : Worker;

      const update = {
        $set: {
          isPhoneVerified: true,
          lastLoginAt: now,
          ...(accountType === "worker"
            ? { workerType: workerType || "job_seeker" }
            : {})
        },
        $setOnInsert: {
          phone,
          ...(accountType === "organization"
            ? { verificationStatus: "pending" }
            : {
              isProfileComplete: false
            })
        }
      };

      return Model.findOneAndUpdate(
        { phone },
        update,
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      );
    }


    const bucket =
      accountType === "organization"
        ? memory.organizations
        : memory.workers;

    const previous = bucket.get(phone) || {
      phone,
      accountType,
      ...(accountType === "worker"
        ? { workerType: workerType || "job_seeker" }
        : { verificationStatus: "pending" }),
      isProfileComplete: false,
      isActive: true,
      createdAt: now
    };

    const updated = {
      ...previous,
      isPhoneVerified: true,
      lastLoginAt: now,
      updatedAt: now
    };

    bucket.set(phone, updated);
    return updated;
  },

  async updateProfile({ phone, accountType, profile }) {
    if (mongoose.connection.readyState === 1) {
      const Model = accountType === "organization" ? Organization : Worker;
      return Model.findOneAndUpdate(
        { phone },
        { $set: profile },
        { new: true, runValidators: true }
      );
    }
    const bucket = memory[accountType === "organization" ? "organizations" : "workers"];
    const existing = bucket.get(phone);
    if (!existing) return null;
    const updated = { ...existing, ...profile, updatedAt: new Date() };
    bucket.set(phone, updated);
    return updated;
  },
};
