import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async () => {
  if (!env.MONGODB_URI) {
    console.warn("MONGODB_URI is empty: using temporary in-memory repositories.");
    return;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
  console.log("MongoDB connected.");
};
