import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { apiRouter } from "../routes/index.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, data: { status: "ok" } });
  });

  app.use("/api", apiRouter);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Route not found: ${req.method} ${req.originalUrl}`,
      },
    });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = (error as any)?.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      error: {
        message: (error as any)?.message || "Internal server error",
        details: (error as any)?.details,
      },
    });
  });

  return app;
}
