import dotenv from "dotenv";
dotenv.config();

const requiredInProduction = ["JWT_SECRET"];
if (process.env.NODE_ENV === "production") {
  for (const key of requiredInProduction) {
    if (!process.env[key]) throw new Error(`${key} is required in production`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  JWT_SECRET: process.env.JWT_SECRET || "local-only-change-this-secret-before-deploying-123456",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  MONGODB_URI: process.env.MONGODB_URI || "",
  TERMII_API_KEY: process.env.TERMII_API_KEY || "",
  TERMII_SENDER_ID: process.env.TERMII_SENDER_ID || "",
  TERMII_CHANNEL: process.env.TERMII_CHANNEL || "generic",
  TERMII_BASE_URL: process.env.TERMII_BASE_URL || "https://v3.api.termii.com",
  OTP_LENGTH: Number(process.env.OTP_LENGTH) || 6,
  OTP_TTL_MINUTES: Number(process.env.OTP_TTL_MINUTES) || 5,
  OTP_MAX_ATTEMPTS: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
  OTP_RESEND_COOLDOWN_SECONDS: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60,
  OTP_DEV_RETURN_CODE: process.env.OTP_DEV_RETURN_CODE === "true"
};
