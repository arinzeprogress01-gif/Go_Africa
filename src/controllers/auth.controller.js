import { requestOtp, verifyOtp, getCurrentUser } from "../services/auth.service.js";

export const sendOtp = async (req, res) => {
  const result = await requestOtp(req.body);
  res.status(200).json({ success: true, message: "OTP sent successfully.", data: result });
};

export const confirmOtp = async (req, res) => {
  const result = await verifyOtp(req.body);
  res.status(200).json({ success: true, message: "Phone number verified successfully.", data: result });
};

export const me = async (req, res) => {
  const user = await getCurrentUser(req.user);
  res.status(200).json({ success: true, data: { user } });
};
