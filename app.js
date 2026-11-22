import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./src/config/env.js";
import authRoutes from "./src/routes/auth.routes.js";
import healthRoutes from "./src/routes/health.routes.js";
import { notFound } from "./src/middleware/not-found.middleware.js";
import { errorHandler } from "./src/middleware/error.middleware.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL === "*" ? true : env.CLIENT_URL.split(",").map((v) => v.trim()),
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.get("/", (_req, res) => {
  res.status(200).json({ success: true, message: "GreenGig Africa API is running." });
});

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
