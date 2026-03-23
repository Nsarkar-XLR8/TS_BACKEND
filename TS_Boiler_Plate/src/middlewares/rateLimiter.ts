import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError.js";
import { createRedisStore } from "../lib/rateLimitStore.js";


function createLimiter(options: {
    windowMs: number;
    limit: number;
    message: string;
    path: string;
}) {
    return rateLimit({
        windowMs: options.windowMs,
        limit: options.limit,
        standardHeaders: true,
        legacyHeaders: false,
        store: createRedisStore(`rl:${options.path}:`),
        handler: (req, _res, next) => {
            next(
                AppError.of(StatusCodes.TOO_MANY_REQUESTS, options.message, [
                    { path: options.path, message: `Rate limit exceeded for ${req.ip}` },
                ])
            );
        },
    });
}

const apiRateLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    message: "Too many requests",
    path: "rateLimit",
});

const authRateLimiter = createLimiter({
    windowMs: 10 * 60 * 1000,
    limit: 30,
    message: "Too many auth attempts",
    path: "auth",
});

const sensitiveActionLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: "Security delay",
    path: "security",
});

const authenticatedUserLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { default: false },
    store: createRedisStore("rl:user:"),
    keyGenerator: (req) => (req.user as { userId?: string } | undefined)?.userId || req.ip || "unknown",
    handler: (_req, _res, next) => {
        next(
            AppError.of(StatusCodes.TOO_MANY_REQUESTS, "Account limit reached", [
                { path: "rateLimit", message: "Too many requests for this account. Slow down." },
            ])
        );
    },
});

const heavyTaskLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    message: "Resource busy",
    path: "resource",
});

const externalApiLimiter = createLimiter({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 50,
    message: "Credit limit reached",
    path: "billing",
});

export const rateLimiter = {
    apiRateLimiter,
    authRateLimiter,
    sensitiveActionLimiter,
    authenticatedUserLimiter,
    heavyTaskLimiter,
    externalApiLimiter,
};