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

/**
 * User-Based Limiting (Authenticated)
 * - Identifies users by their userId instead of IP.
 * - Prevents one malicious user from affecting an entire corporate network IP.
 * - MUST be placed AFTER Auth() middleware in the route.
 */
const authenticatedUserLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500, // high limit for logged-in users
    standardHeaders: true,
    legacyHeaders: false,
    validate: { default: false }, // Disable internal IP validation for custom key generator
    keyGenerator: (req) => {
        // Fallback to IP if userId isn't available (e.g. middleware misplacement)
        return req.user?.userId || req.ip || "unknown";
    },
    handler: (_req, _res, next) => {
        next(
            AppError.of(StatusCodes.TOO_MANY_REQUESTS, "Account limit reached", [
                { path: "rateLimit", message: "Too many requests for this account. Slow down." }
            ])
        );
    }
});

/**
 * Resource-Specific Limiting (Expensive Tasks)
 * - Use for heavy CPU/Memory tasks like PDF generation or large exports.
 */
const heavyTaskLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 20, // e.g. 20 heavy reports per hour
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
        next(
            AppError.of(StatusCodes.TOO_MANY_REQUESTS, "Resource busy", [
                { path: "resource", message: "Heavy task limit reached. Try again in an hour." }
            ])
        );
    }
});

/**
 * External API Limiter
 * - Use for routes that wrap paid third-party services (OpenAI, Stripe, etc).
 */
const externalApiLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    limit: 50, // 50 credits/calls per day
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
        next(
            AppError.of(StatusCodes.TOO_MANY_REQUESTS, "Credit limit reached", [
                { path: "billing", message: "Daily external service quota exceeded." }
            ])
        );
    }
});

export const rateLimiter = {
    apiRateLimiter,
    authRateLimiter,
    sensitiveActionLimiter,
    authenticatedUserLimiter,
    heavyTaskLimiter,
    externalApiLimiter
};
