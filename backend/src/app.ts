import express from "express";
import helmet from "helmet";
import cors from "cors";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs/openapi.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(cookieParser());

app.use(pinoHttp());

app.get("/api/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;

  return res.status(200).json({
    success: true,
    message: "Moneta api is running",
    data: {
      status: "healthy",
      connection: "connected",
    },
  });
});

app.use("/api/auth", authRoutes);

app.get("/api/docs.json", (_req, res) => {
  res.status(200).json(openApiDocument);
});

if (env.NODE_ENV !== "production") {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      explorer: true,

      // Konfigurasi tampilan Swagger UI.
      customSiteTitle: "MONETA API Documentation",

      swaggerOptions: {
        displayRequestDuration: true,
        docExpansion: "list",
        filter: true,

        // Mengizinkan pengiriman browser-managed credentials.
        withCredentials: true,
      },
    }),
  );
}

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Resource not found",
  });
});

app.use(errorHandler);

export { app };
