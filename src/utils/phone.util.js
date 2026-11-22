import { ApiError } from "./api-error.js";

export const normalizePhone = (value) => {
  if (typeof value !== "string") throw new ApiError(400, "A valid phone number is required.");
  let phone = value.replace(/[\\s()-]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  if (/^0\d{10}$/.test(phone)) phone = `+234${phone.slice(1)}`;
  if (/^234\d{10}$/.test(phone)) phone = `+${phone}`;
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new ApiError(400, "Use a valid international phone number, e.g. +2348031234567.");
  }
  return phone;
};
