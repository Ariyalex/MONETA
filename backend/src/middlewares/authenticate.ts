import type { RequestHandler } from "express";
import { AUTH_COOKIE_NAME } from "../modules/auth/auth.constants.js";
import { AppError } from "../shared/errors/app-error.js";
import { authService } from "../modules/auth/auth.service.js";

export const authenticate: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (typeof token !== "string" || !token) {
    return next(new AppError(401, "Authentication required"));
  }

  try {
    req.auth = await authService.verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
};
