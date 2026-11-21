import express from "express";
import helmet from "helmet";
import cors from "cors";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

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

export { app };
