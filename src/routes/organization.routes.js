import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

import {
    setupOrganizationProfile,
    getOrganizationProfile
} from "../controllers/organization.controller.js";

import {
    createTask,
    discoverTasks,
    getTaskDetails,
    getMyOrganizationTasks
} from "../controllers/organization-task.controller.js";

const router = Router();

// Public task discovery
router.get("/tasks", asyncHandler(discoverTasks));
router.get("/tasks/:id", asyncHandler(getTaskDetails));

// Authenticated organization operations
router.post(
    "/profile",
    requireAuth,
    asyncHandler(setupOrganizationProfile)
);

router.get(
    "/profile",
    requireAuth,
    asyncHandler(getOrganizationProfile)
);

router.post(
    "/tasks",
    requireAuth,
    asyncHandler(createTask)
);

router.get(
    "/my-tasks",
    requireAuth,
    asyncHandler(getMyOrganizationTasks)
);

export default router;