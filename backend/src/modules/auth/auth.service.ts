import argon2 from "argon2";

import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { authRepository } from "./auth.repository.js";
import { LoginInput } from "./auth.schema.js";
import { jwtVerify, SignJWT } from "jose";
import { AUTH_TOKEN_TTL_SECONDS } from "./auth.constants.js";

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

export const authService = {
  async login(input: LoginInput) {
    const user = await authRepository.findByUsername(input.username);

    if (!user) {
      throw new AppError(401, "Invalid username or password");
    }

    const passwordValid = await argon2.verify(
      user.passwordHash,
      input.password,
    );

    if (!passwordValid) {
      throw new AppError(401, "Invalid username or password");
    }

    const token = await new SignJWT({
      username: user.username,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(`${AUTH_TOKEN_TTL_SECONDS}s`)
      .sign(jwtSecret);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  },

  async verifyAccessToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, jwtSecret, {
        algorithms: ["HS256"],
      });

      if (
        typeof payload.sub !== "string" ||
        typeof payload.username !== "string"
      ) {
        throw new Error("Invalid token payload");
      }

      return {
        userId: payload.sub,
        username: payload.username,
      };
    } catch {
      throw new AppError(401, "Invalid or expired authentication token");
    }
  },

  async getProfile(userId: string) {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new AppError(401, "User account no longer exists");
    }

    return user;
  },
};
