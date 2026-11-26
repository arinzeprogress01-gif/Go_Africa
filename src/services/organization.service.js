import mongoose from "mongoose";
import { Organization } from "../models/organization.model.js";
import { ApiError } from "../utils/api-error.js";

const memory = new Map();

export const organizationService = {
    async setupProfile(phone, payload) {
        const {
            name,
            organizationType,
            cacNumber,
            contactPersonName,
            officeAddress
        } = payload;

        if (!name || !contactPersonName || !officeAddress) {
            throw new ApiError(
                400,
                "Organization name, contact person and office address are required."
            );
        }

        const update = {
            name: name.trim(),
            organizationType: organizationType || "other",
            cacNumber: cacNumber?.trim() || "",
            contactPersonName: contactPersonName.trim(),
            officeAddress: officeAddress.trim(),
            isProfileComplete: true
        };

        if (mongoose.connection.readyState === 1) {
            const organization = await Organization.findOneAndUpdate(
                { phone },
                { $set: update },
                { new: true, runValidators: true }
            );

            if (!organization) {
                throw new ApiError(404, "Organization account not found.");
            }

            return organization;
        }

        const existing = memory.get(phone);

        if (!existing) {
            throw new ApiError(404, "Organization account not found.");
        }

        const updated = { ...existing, ...update };
        memory.set(phone, updated);
        return updated;
    },

    async getProfile(phone) {
        if (mongoose.connection.readyState === 1) {
            const organization = await Organization.findOne({ phone });

            if (!organization) {
                throw new ApiError(404, "Organization account not found.");
            }

            return organization;
        }

        const organization = memory.get(phone);

        if (!organization) {
            throw new ApiError(404, "Organization account not found.");
        }

        return organization;
    }
};