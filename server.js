import app from "./app.js";
import { env } from "./src/config/env.js";
import { connectDatabase } from "./src/config/database.js";

const startServer = async () => {
  try {
    await connectDatabase();
    const server = app.listen(env.PORT, () => {
      console.log(`GreenGig API listening on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Closing server...`);
      server.close(() => process.exit(0));
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
