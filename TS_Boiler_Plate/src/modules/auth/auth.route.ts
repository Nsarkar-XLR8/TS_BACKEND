import { Router } from "express";
import { AuthController } from "./auth.controller";

import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import rateLimit from "express-rate-limit";
import { rateLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.post(
    "/login",
    rateLimiter.apiRateLimiter,
    validateRequest(AuthValidation.loginSchema),
    AuthController.loginUser
);

router.post(
    "/register",
    rateLimiter.apiRateLimiter,
    validateRequest(AuthValidation.registerSchema),
    AuthController.registerUser
);

router.post(
    "/verify-email",
    rateLimiter.apiRateLimiter,
    validateRequest(AuthValidation.verifyEmailSchema),
    AuthController.verifyEmail
);

export const AuthRoutes = router;