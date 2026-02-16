import { rateLimiter } from "@/middlewares/rateLimiter.js";
import validateRequest from "@/middlewares/validateRequest.js";
import { Router } from "express";
import { AuthValidation } from "./auth.validation.js";
import { AuthController } from "./auth.controller.js";


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

router.post(
    '/forgot-password',
    validateRequest(AuthValidation.forgotPasswordSchema),
    AuthController.forgotPassword
);

router.post(
    '/verify-otp',
    validateRequest(AuthValidation.verifyOtpSchema),
    AuthController.verifyOtp
);


router.patch(
    '/reset-password',
    validateRequest(AuthValidation.resetPasswordSchema),
    AuthController.resetPassword
);

export const AuthRoutes = router;