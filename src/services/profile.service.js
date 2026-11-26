import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/api-error.js";

const allowedInterests = [
    "waste_collection",
    "tree_planting",
    "urban_farming",
    "climate_data",
    "recycling",
    "community_education"
];

export const saveWorkerProfile = async (claims, payload) => {
    if (claims.accountType !== "worker") {
        throw new ApiError(403, "This profile form is for worker accounts only.");
    }

    const fullName = String(payload.fullName || "").trim();
    const lga = String(payload.lga || "").trim();
    const taskInterests = Array.isArray(payload.taskInterests)
        ? [...new Set(payload.taskInterests.map((item) => String(item).trim()))]
        : [];

    if (fullName.length < 2 || fullName.length > 100) {
        throw new ApiError(400, "Enter your full name (2 to 100 characters).");
    }
    if (!lga) throw new ApiError(400, "Select your LGA.");
    if (!taskInterests.length) throw new ApiError(400, "Select at least one climate interest.");
    if (taskInterests.some((item) => !allowedInterests.includes(item))) {
        throw new ApiError(400, "One or more climate interests are invalid.");
    }

    const user = await userRepository.updateProfile({
        phone: claims.phone,
        accountType: claims.accountType,
        profile: { fullName, lga, taskInterests, isProfileComplete: true }
    });

    if (!user) throw new ApiError(404, "User account not found.");
    return user;
};
