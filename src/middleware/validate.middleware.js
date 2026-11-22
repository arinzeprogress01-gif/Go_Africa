import { ApiError } from "../utils/api-error.js";

export const validateOtpRequest = (req, _res, next) => {
  const { phone, accountType } = req.body || {};
  if (!phone || !accountType) return next(new ApiError(400, "phone and accountType are required."));
  next();
};

export const validateOtpVerification = (req, _res, next) => {
  const { phone, accountType, otp } = req.body || {};
  if (!phone || !accountType || !otp) {
    return next(new ApiError(400, "phone, accountType and otp are required."));
  }
  next();
};
