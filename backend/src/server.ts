import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import logger from "./utils/logger";
import { displayServerInfo } from "./utils/terminalUtils";

import { envVariable } from "./config/envVariable";
import apiRoutes from "./routes/routes";
import openApiRoutes from "./openApiSpecification/openApiRoutes";
import {
  globalErrorMiddleware,
  routeNotFoundMiddleware,
} from "./middleware/errorMiddleware";
import { dbClientMiddleware } from "./middleware/dbClientMiddleware";
import { initializeSocket } from "./socket/socket";

async function main() {
  const app = express();
  const server = http.createServer(app);

  initializeSocket(server);

  // Middleware
  app.use(helmet());
  app.use(cors({ origin: "*", credentials: true }));
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  /** Routes */
  app.use("/api", dbClientMiddleware, apiRoutes);
  app.use("/docs", openApiRoutes);

  /** Health check endpoint */
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      message: "Server is running",
      timestamp: new Date().toISOString(),
    });
  });

  /** 404 handler - must come after all routes */
  app.use(routeNotFoundMiddleware);

  /** Global error handler - must be last */
  app.use(globalErrorMiddleware);

  /** Start server */
  server.listen(envVariable.API_PORT, () => {
    displayServerInfo({
      port: envVariable.API_PORT,
      host: envVariable.API_HOST,
      appName: "📚 Team Orbit Backend",
      docsPath: "/docs",
    });
  });
}

// Handle unhandled promise rejections gracefully
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled Promise Rejection:", {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise,
  });
  // Don't exit - let the server continue running
  // Individual request errors should be handled by middleware
});

// Handle uncaught exceptions gracefully
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", {
    message: error.message,
    stack: error.stack,
  });
  // For uncaught exceptions, we might want to exit after logging
  // But for now, let's just log and continue (you can change this if needed)
  // process.exit(1);
});

main().catch(error => {
  logger.error("Error in main function:", error);
  process.exit(1);
});
