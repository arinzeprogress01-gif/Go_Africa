import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  sendOtp,
  confirmOtp,
  me
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  validateOtpRequest,
  validateOtpVerification
} from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { setupWorkerProfile } from "../controllers/profile.controller.js";


const router = Router();

const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Try again later."
  }
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts. Try again later."
  }
});

// Frontend contract
router.post(
  ["/request-otp", "/request-otp/"],
  otpSendLimiter,
  validateOtpRequest,
  asyncHandler(sendOtp)
);

router.post(
  ["/verify-otp", "/verify-otp/"],
  otpVerifyLimiter,
  validateOtpVerification,
  asyncHandler(confirmOtp)
);

// Backward-compatible routes
router.post(
  "/otp/send",
  otpSendLimiter,
  validateOtpRequest,
  asyncHandler(sendOtp)
);

router.post(
  "/otp/verify",
  otpVerifyLimiter,
  validateOtpVerification,
  asyncHandler(confirmOtp)
);

router.get("/me", requireAuth, asyncHandler(me));
router.post("/profile/setup", requireAuth, asyncHandler(setupWorkerProfile));
export default router;