import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { sendError } from "../utils/sendError.js";
import { handleZodError } from "../errors/handleZodError.js";
import { handleDuplicateKeyError } from "../errors/handleDuplicateKeyError.js";
import { handleCastError } from "../errors/handleCastError.js";
import { handleMongooseValidationError } from "../errors/handleMongooseValidationError.js";
import { handleJwtError } from "../errors/handleJwtError.js";
import { handleMulterError } from "../errors/handleMulterError.js";
import { handleJsonSyntaxError } from "../errors/handleJsonSyntaxError.js";
import AppError from "../errors/AppError.js";
import multer from "multer";
import { logger } from "../config/logger.js";

interface ErrorWithCode {
    code?: number;
    name?: string;
}

interface ErrorWithStatusCodeAndMessage {
    statusCode?: number;
    status?: number;
    message?: string;
}

function isMongoDuplicateKeyError(err: unknown): boolean {
    return typeof err === "object" && err !== null && (err as ErrorWithCode).code === 11000;
}

function isMongooseCastError(err: unknown): boolean {
    return typeof err === "object" && err !== null && (err as ErrorWithCode).name === "CastError";
}

function isMongooseValidationError(err: unknown): boolean {
    return typeof err === "object" && err !== null && (err as ErrorWithCode).name === "ValidationError";
}

function isJwtError(err: unknown): boolean {
    const names = ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"];
    return typeof err === "object" && err !== null && names.includes((err as ErrorWithCode).name || "");
}

function isJsonSyntaxError(err: unknown): err is SyntaxError {
    return err instanceof SyntaxError && "body" in err;
}

function fromLibError(err: unknown): AppError | undefined {
    if (typeof err !== "object" || err === null) return undefined;

    const anyErr = err as ErrorWithStatusCodeAndMessage;
    let statusCode: number | undefined;
    if (typeof anyErr.statusCode === "number") {
        statusCode = anyErr.statusCode;
    } else if (typeof anyErr.status === "number") {
        statusCode = anyErr.status;
    }

    const message = typeof anyErr.message === "string" ? anyErr.message : undefined;

    if (statusCode && message) {
        return AppError.of(statusCode, message, [{ path: "general", message }]);
    }
    return undefined;
}

function normalizeError(err: unknown): AppError {
    if (err instanceof AppError) return err;
    if (err instanceof ZodError) return handleZodError(err);
    if (isMongoDuplicateKeyError(err)) return handleDuplicateKeyError(err);
    if (isMongooseCastError(err)) return handleCastError(err);
    if (isMongooseValidationError(err)) return handleMongooseValidationError(err);
    if (isJwtError(err)) return handleJwtError(err);
    if (err instanceof multer.MulterError) return handleMulterError(err);
    if (isJsonSyntaxError(err)) return handleJsonSyntaxError(err);

    return fromLibError(err) ?? AppError.internal();
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    const normalized = normalizeError(err);

    // SERVER-SIDE LOGGING: Log the error with request context (traceId/spanId via mixin)
    logger.error({ err, requestId: req.requestId }, normalized.message);

    // Hide details for non-operational errors in production
    if (!normalized.isOperational && (process.env.NODE_ENV ?? "development") === "production") {
        return sendError({
            res,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            code: "HTTP_INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
            errorSource: [{ path: "general", message: "Internal Server Error" }],
            ...(req.requestId === undefined ? {} : { requestId: req.requestId })
        });
    }

    return sendError({
        res,
        statusCode: normalized.statusCode,
        code: normalized.code,
        message: normalized.message,
        errorSource: normalized.errorSource,
        ...(req.requestId === undefined ? {} : { requestId: req.requestId }),
        ...(err instanceof Error && err.stack === undefined ? {} : { stack: (err as Error).stack })
    });
};
