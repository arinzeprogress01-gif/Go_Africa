import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export const sendOtpSms = async ({ to, otp }) => {
  const message =
    `Your GreenGig Africa verification code is ${otp}. ` +
    `It expires in ${env.OTP_TTL_MINUTES} minutes. Do not share this code.`;

  // Fast, free local/demo mode. No SMS provider is called.
  if (env.OTP_PROVIDER === "development") {
    if (env.NODE_ENV === "production") {
      throw new ApiError(
        503,
        "Development OTP mode is disabled in production."
      );
    }

    console.log(`[DEV OTP] ${to}: ${otp}`);
    return { provider: "development" };
  }

  if (env.OTP_PROVIDER !== "africastalking") {
    throw new ApiError(500, "Unsupported OTP provider.");
  }

  if (!env.AT_API_KEY || !env.AT_USERNAME) {
    throw new ApiError(503, "Africa's Talking credentials are not configured.");
  }

  const isSandbox = env.AT_ENV === "sandbox";
  const endpoint = isSandbox
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";

  const form = new URLSearchParams({
    username: env.AT_USERNAME,
    to,
    message
  });

  if (env.AT_SENDER_ID) {
    form.set("from", env.AT_SENDER_ID);
  }

  let response;
  let payload;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        apiKey: env.AT_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form,
      signal: AbortSignal.timeout(15000)
    });

    payload = await response.json();
  } catch (error) {
    console.error("Africa's Talking request failed:", error.message);
    throw new ApiError(502, "Could not connect to the SMS provider.");
  }

  if (!response.ok) {
    console.error("Africa's Talking rejected the request:", payload);
    throw new ApiError(502, "SMS provider rejected the OTP request.");
  }

  const recipient = payload?.SMSMessageData?.Recipients?.[0];
  const statusCode = Number(recipient?.statusCode);

  // AT reports per-recipient delivery acceptance in statusCode.
  if (!recipient || (Number.isFinite(statusCode) && statusCode !== 101)) {
    console.error("Africa's Talking SMS response:", payload);
    throw new ApiError(502, "SMS provider did not accept the OTP message.");
  }

  return {
    provider: "africastalking",
    messageId: recipient.messageId || null,
    status: recipient.status || "accepted"
  };
};