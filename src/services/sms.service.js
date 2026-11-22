import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export const sendOtpSms = async ({ to, otp }) => {
  if (!env.TERMII_API_KEY || !env.TERMII_SENDER_ID) {
    if (env.NODE_ENV !== "production" && env.OTP_DEV_RETURN_CODE) {
      console.warn(`[DEV ONLY] OTP for ${to}: ${otp}`);
      return { provider: "development" };
    }
    throw new ApiError(503, "SMS service is not configured. Add Termii credentials.");
  }

  const response = await fetch(`${env.TERMII_BASE_URL}/api/sms/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: env.TERMII_API_KEY,
      to,
      from: env.TERMII_SENDER_ID,
      sms: `Your GreenGig Africa verification code is ${otp}. It expires in ${env.OTP_TTL_MINUTES} minutes. Do not share this code.`,
      type: "plain",
      channel: env.TERMII_CHANNEL
    }),
    signal: AbortSignal.timeout(15000)
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.code === "error") {
    console.error("Termii send failed:", payload);
    throw new ApiError(502, "We could not send your OTP SMS. Please try again.");
  }
  return { provider: "termii", messageId: payload.message_id || null };
};
