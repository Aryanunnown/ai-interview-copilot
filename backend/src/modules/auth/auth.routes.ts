import { Router } from "express";
import { register, login, profile } from "./auth.controller.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(register));
authRouter.post("/login", validate(loginSchema), asyncHandler(login));
authRouter.get("/profile", requireAuth, asyncHandler(profile));
