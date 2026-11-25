import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { otpRepository } from "../repositories/otp.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { sendOtpSms } from "./sms.service.js";
import { normalizePhone } from "../utils/phone.util.js";
import { generateOtp, hashOtp, safeCompareOtp } from "../utils/otp.util.js";
import { ApiError } from "../utils/api-error.js";

const validAccountTypes = ["worker", "organization"];
const validWorkerTypes = ["job_seeker", "volunteer"];

export const requestOtp = async ({ phone: rawPhone, accountType, workerType }) => {
  const phone = normalizePhone(rawPhone);
  if (!validAccountTypes.includes(accountType)) {
    throw new ApiError(400, "accountType must be worker or organization.");
  }
  if (accountType === "worker" && workerType && !validWorkerTypes.includes(workerType)) {
    throw new ApiError(400, "workerType must be job_seeker or volunteer.");
  }

  const existing = await otpRepository.findByPhone(phone);
  if (existing && Date.now() - existing.lastSentAt < env.OTP_RESEND_COOLDOWN_SECONDS * 1000) {
    const wait = Math.ceil((env.OTP_RESEND_COOLDOWN_SECONDS * 1000 - (Date.now() - existing.lastSentAt)) / 1000);
    throw new ApiError(429, `Please wait ${wait} seconds before requesting another OTP.`);
  }

  const otp = generateOtp();
  await sendOtpSms({ to: phone, otp });

  await otpRepository.save(phone, {
    otpHash: hashOtp(otp),
    accountType,
    workerType: accountType === "worker" ? (workerType || "job_seeker") : null,
    expiresAt: Date.now() + env.OTP_TTL_MINUTES * 60 * 1000,
    attempts: 0,
    lastSentAt: Date.now()
  });

  return {
    phone,
    expiresInSeconds: env.OTP_TTL_MINUTES * 60,
    ...(env.NODE_ENV !== "production" && env.OTP_DEV_RETURN_CODE ? { developmentOtp: otp } : {})
  };
};

export const verifyOtp = async ({ phone: rawPhone, accountType, workerType, otp }) => {
  const phone = normalizePhone(rawPhone);
  if (!validAccountTypes.includes(accountType)) throw new ApiError(400, "Invalid accountType.");
  const otpPattern = new RegExp(`^\\d{${env.OTP_LENGTH}}$`);

  if (typeof otp !== "string" || !otpPattern.test(otp)) {
    throw new ApiError(400, `Enter the ${env.OTP_LENGTH}-digit OTP.`);
  };

  const record = await otpRepository.findByPhone(phone);
  if (!record) throw new ApiError(400, "No active OTP found. Request a new code.");
  if (record.expiresAt < Date.now()) {
    await otpRepository.delete(phone);
    throw new ApiError(400, "OTP has expired. Request a new code.");
  }
  if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
    await otpRepository.delete(phone);
    throw new ApiError(429, "Too many incorrect attempts. Request a new OTP.");
  }
  if (record.accountType !== accountType) throw new ApiError(400, "Account type does not match the OTP request.");

  if (!safeCompareOtp(otp, record.otpHash)) {
    record.attempts += 1;
    await otpRepository.save(phone, record);
    throw new ApiError(400, "Incorrect OTP.");
  }

  await otpRepository.delete(phone);
  const resolvedWorkerType = workerType || record.workerType || "job_seeker";
  if (accountType === "worker" && !validWorkerTypes.includes(resolvedWorkerType)) {
    throw new ApiError(400, "Invalid workerType.");
  }

  const user = await userRepository.createOrUpdateVerifiedUser({
    phone, accountType, workerType: resolvedWorkerType
  });
  const token = jwt.sign(
    { sub: String(user._id || phone), phone, accountType },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return { token, user: sanitizeUser(user, accountType) };
};

const sanitizeUser = (user, accountType) => {
  const plain = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete plain.__v;
  return { ...plain, accountType };
};

export const getCurrentUser = async (claims) => {
  const user = await userRepository.findByPhone(claims.phone, claims.accountType);
  if (!user) throw new ApiError(404, "User account not found.");
  return sanitizeUser(user, claims.accountType);
};
