import { CookieOptions, Request, Response } from "express";
import { env } from "../../config/env.js";
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from "./auth.constants.js";
import { LoginInput } from "./auth.schema.js";
import { authService } from "./auth.service.js";
import { AppError } from "../../shared/errors/app-error.js";

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: AUTH_COOKIE_MAX_AGE,
};

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const input = req.body as LoginInput;
    const result = await authService.login(input);

    res.cookie(AUTH_COOKIE_NAME, result.token, authCookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
      },
    });
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.auth) {
      throw new AppError(401, "Authentication required");
    }

    const user = await authService.getProfile(req.auth.userId);

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        user,
      },
    });
  },

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  },
};
