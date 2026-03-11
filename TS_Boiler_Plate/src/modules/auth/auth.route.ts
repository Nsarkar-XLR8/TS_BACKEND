import { rateLimiter } from "@/middlewares/rateLimiter.js";
import validateRequest from "@/middlewares/validateRequest.js";
import { Router } from "express";
import { AuthValidation } from "./auth.validation.js";
import { AuthController } from "./auth.controller.js";
import { Auth } from "@/middlewares/Auth.js";


const router = Router();

router.post(
    "/login",
    rateLimiter.authRateLimiter,
    validateRequest(AuthValidation.loginSchema),
    AuthController.loginUser
);

router.post(
    "/register",
    rateLimiter.authRateLimiter,
    validateRequest(AuthValidation.registerSchema),
    AuthController.registerUser
);

router.post(
    "/verify-email",
    rateLimiter.authRateLimiter,
    validateRequest(AuthValidation.verifyEmailSchema),
    AuthController.verifyEmail
);

router.post(
    '/forgot-password',
    rateLimiter.authRateLimiter,
    validateRequest(AuthValidation.forgotPasswordSchema),
    AuthController.forgotPassword
);

router.post(
    '/verify-otp',
    rateLimiter.sensitiveActionLimiter,
    validateRequest(AuthValidation.verifyOtpSchema),
    AuthController.verifyOtp
);


router.patch(
    '/reset-password',
    rateLimiter.sensitiveActionLimiter,
    validateRequest(AuthValidation.resetPasswordSchema),
    AuthController.resetPassword
);

// ── New Routes ───────────────────────────────────────────────────────

router.post(
    '/refresh-token',
    rateLimiter.authRateLimiter,
    validateRequest(AuthValidation.refreshTokenSchema),
    AuthController.refreshToken
);

router.post(
    '/logout',
    Auth(),
    AuthController.logoutUser
);

router.post(
    '/resend-otp',
    rateLimiter.sensitiveActionLimiter,
    validateRequest(AuthValidation.resendOtpSchema),
    AuthController.resendOtp
);

export const AuthRoutes = router;