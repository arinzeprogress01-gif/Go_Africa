import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return next(new ApiError(401, "Authentication required."));
  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired authentication token."));
  }
};
