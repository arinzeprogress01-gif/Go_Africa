import crypto from "node:crypto";
import { env } from "../config/env.js";

export const generateOtp = () => {
  const min = 10 ** (env.OTP_LENGTH - 1);
  const max = (10 ** env.OTP_LENGTH) - 1;
  return String(crypto.randomInt(min, max + 1));
};

export const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

export const safeCompareOtp = (provided, storedHash) => {
  const providedHash = Buffer.from(hashOtp(provided), "hex");
  const expectedHash = Buffer.from(storedHash, "hex");
  return providedHash.length === expectedHash.length &&
    crypto.timingSafeEqual(providedHash, expectedHash);
};
