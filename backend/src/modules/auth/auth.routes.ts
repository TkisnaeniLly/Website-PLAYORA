import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { loginPerAkunRateLimiter, loginPerIpRateLimiter, registerRateLimiter } from "../../middlewares/rateLimit";
import { loginSchema, registerSchema } from "./auth.schema";
import {
  getCsrfToken,
  getMe,
  postLogin,
  postLogout,
  postRegister,
} from "./auth.controller";

export const authRoutes = Router();

authRoutes.get("/csrf", getCsrfToken);

authRoutes.post(
  "/register",
  registerRateLimiter,
  validate(registerSchema),
  postRegister,
);

authRoutes.post(
  "/login",
  loginPerIpRateLimiter,
  loginPerAkunRateLimiter,
  validate(loginSchema),
  postLogin,
);

// Logout sengaja tidak mewajibkan sesi valid: menghapus cookie tetap harus bisa
// dilakukan walau token sudah kedaluwarsa.
authRoutes.post("/logout", postLogout);

authRoutes.get("/me", authenticate, getMe);
