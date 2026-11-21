import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validateBody } from "../../middlewares/validate-body.js";
import { loginSchema } from "./auth.schema.js";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many login attempts. Please try again later",
  },
});

router.post(
  "/login",
  loginLimiter,
  validateBody(loginSchema),
  authController.login,
);

router.get("/me", authenticate, authController.me);

router.post("/logout", authController.logout);

export default router;
