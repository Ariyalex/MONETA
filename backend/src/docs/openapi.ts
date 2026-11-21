import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { AUTH_COOKIE_NAME } from "../modules/auth/auth.constants.js";
import { z } from "zod";

import { loginSchema } from "../modules/auth/auth.schema.js";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

const cookieAuth = registry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: AUTH_COOKIE_NAME,
  description:
    "Authentication menggunakan HttpOnly Cookie yang diperoleh setelah login",
});

const ErrorResponseSchema = registry.register(
  "ErrorResponse",
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
);

const ValidationErrorResponseSchema = registry.register(
  "ValidationErrorResponse",
  z.object({
    success: z.literal(false),
    message: z.string(),
    errors: z.array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    ),
  }),
);

const AuthUserSchema = registry.register(
  "AuthUser",
  z.object({
    id: z.uuid(),
    username: z.string(),
  }),
);

const LoginResponseSchema = registry.register(
  "LoginResponse",
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.object({
      user: AuthUserSchema,
    }),
  }),
);

const AuthProfileResponseSchema = registry.register(
  "AuthProfileResponse",
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.object({
      user: z.object({
        id: z.uuid(),
        username: z.string(),
        createdAt: z.iso.datetime(),
      }),
    }),
  }),
);

const LogoutResponseSchema = registry.register(
  "LogoutResponse",
  z.object({
    success: z.literal(true),
    message: z.string(),
  }),
);

registry.registerPath({
  method: "get",
  path: "/api/health",
  tags: ["System"],
  summary: "Check API health",
  description: "memeriksa status backend dn koneksi postgresql",
  responses: {
    200: {
      description: "API dan database berjalan normal",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            message: z.string(),
            data: z.object({
              status: z.string(),
              connection: z.string(),
            }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Authentication"],
  summary: "Login",
  description:
    "Melakukan autentikasi menggunakan username dan password. JWT dikirim melalui HttpOnly cookie.",
  request: {
    body: {
      description: "kredensial",
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login berhasil",
      content: {
        "application/json": {
          schema: LoginResponseSchema,
        },
      },
    },
    400: {
      description: "requset body tidak valid",
      content: {
        "application/json": {
          schema: ValidationErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Username atau password salah.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },

    429: {
      description: "Terlalu banyak percobaan login.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },

    500: {
      description: "Terjadi kesalahan pada server.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/me",
  tags: ["Authentication"],
  summary: "Get current administrator",
  description:
    "Mengambil profil administrator berdasarkan JWT yang tersimpan dalam HttpOnly Cookie.",

  // Endpoint ini memerlukan autentikasi.
  security: [
    {
      [cookieAuth.name]: [],
    },
  ],

  responses: {
    200: {
      description: "Profil administrator berhasil diperoleh.",
      content: {
        "application/json": {
          schema: AuthProfileResponseSchema,
        },
      },
    },

    401: {
      description: "Cookie tidak tersedia atau token tidak valid.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },

    500: {
      description: "Terjadi kesalahan pada server.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/logout",
  tags: ["Authentication"],
  summary: "Administrator logout",
  description: "Menghapus HttpOnly Cookie autentikasi dari browser.",

  responses: {
    200: {
      description: "Logout berhasil.",
      content: {
        "application/json": {
          schema: LogoutResponseSchema,
        },
      },
    },
  },
});

const generator = new OpenApiGeneratorV31(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: "3.1.0",
  info: {
    title: "MONETA API",
    version: "1.0.0",
    description: `
# MONETA Backend API

REST API untuk sistem Monitoring Network Anomalies.

API ini menyediakan fitur:
- Administrator authentication
- Monitoring target management
- Network metrics
- AI detection results
- Incident management
        `,
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],

  tags: [
    {
      name: "System",
      description: "System health and availability.",
    },
    {
      name: "Authentication",
      description: "Administrator authentication.",
    },
    {
      name: "Monitoring Targets",
      description: "Monitoring target management.",
    },
    {
      name: "Metrics",
      description: "Network monitoring metrics.",
    },
    {
      name: "Detection Results",
      description: "AI anomaly detection results.",
    },
    {
      name: "Incidents",
      description: "Incident management.",
    },
  ],
});
