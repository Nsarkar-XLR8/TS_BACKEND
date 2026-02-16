import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError.js";


/**
 * General API rate limiter.
 * - Uses IP-based limiting by default
 * - Sends errors through AppError so your global errorHandler formats the response
 */
const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300, // adjust for your needs (e.g., 100/15m for public APIs)
    standardHeaders: true, // adds RateLimit-* headers (RFC-ish)
    legacyHeaders: false,

    // If you're behind a reverse proxy, set app.set("trust proxy", 1) in app.ts
    // Otherwise req.ip may not reflect the real client IP.

    handler: (req, _res, next) => {
        next(
            AppError.of(StatusCodes.TOO_MANY_REQUESTS, "Too many requests", [
                { path: "rateLimit", message: `Rate limit exceeded for IP: ${req.ip}` }
            ])
        );
    }
});

/**
 * Stricter limiter for auth endpoints (login/register/forgot-password).
 */
const authRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 30, // e.g., 30 attempts per 10 minutes
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, _res, next) => {
        next(
            AppError.of(StatusCodes.TOO_MANY_REQUESTS, "Too many attempts", [
                { path: "auth", message: `Too many auth attempts for IP: ${req.ip}` }
            ])
        );
    }
});

/**
 * Extremely strict limiter for sensitive actions like OTP verification
 * and password resets.
 */
const sensitiveActionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // 10 attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
        next(
            AppError.of(StatusCodes.TOO_MANY_REQUESTS, "Security delay", [
                { path: "security", message: "Too many sensitive attempts. Please wait 15 minutes." }
            ])
        );
    }
});

export const rateLimiter = {
    apiRateLimiter,
    authRateLimiter,
    sensitiveActionLimiter
};
