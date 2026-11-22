import { Router } from "express";
import { sendOtp, confirmOtp, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateOtpRequest, validateOtpVerification } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import rateLimit from "express-rate-limit";

const router = Router();

const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many OTP requests. Try again later." }
});
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many verification attempts. Try again later." }
});

router.post("/otp/send", otpSendLimiter, validateOtpRequest, asyncHandler(sendOtp));
router.post("/otp/verify", otpVerifyLimiter, validateOtpVerification, asyncHandler(confirmOtp));
router.get("/me", requireAuth, asyncHandler(me));

export default router;
