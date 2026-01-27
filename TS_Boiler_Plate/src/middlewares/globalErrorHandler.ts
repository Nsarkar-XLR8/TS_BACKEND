import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { sendError } from "../utils/sendError";
import { handleZodError } from "../errors/handleZodError";
import { handleDuplicateKeyError } from "../errors/handleDuplicateKeyError";
import { handleCastError } from "../errors/handleCastError";
import AppError from "../errors/AppError";

function isMongoDuplicateKeyError(err: unknown): boolean {
    return typeof err === "object" && err !== null && (err as any).code === 11000;
}

function isMongooseCastError(err: unknown): boolean {
    return typeof err === "object" && err !== null && (err as any).name === "CastError";
}

function normalizeError(err: unknown): AppError {
    if (err instanceof AppError) return err;
    if (err instanceof ZodError) return handleZodError(err);
    if (isMongoDuplicateKeyError(err)) return handleDuplicateKeyError(err);
    if (isMongooseCastError(err)) return handleCastError(err);

    // Respect status codes from other libs
    if (typeof err === "object" && err !== null) {
        const anyErr = err as any;

        const statusCode =
            typeof anyErr.statusCode === "number"
                ? anyErr.statusCode
                : typeof anyErr.status === "number"
                    ? anyErr.status
                    : undefined;

        const message = typeof anyErr.message === "string" ? anyErr.message : undefined;

        if (statusCode && message) {
            return AppError.of(statusCode, message, [{ path: "general", message }]);
        }
    }

    return AppError.internal();
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    const normalized = normalizeError(err);

    // Hide details for non-operational errors in production
    if (!normalized.isOperational && (process.env.NODE_ENV ?? "development") === "production") {
        return sendError({
            res,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Something went wrong",
            errorSource: [{ path: "general", message: "Internal Server Error" }],
            ...(req.requestId !== undefined ? { requestId: req.requestId } : {})
        });
    }

    return sendError({
        res,
        statusCode: normalized.statusCode,
        message: normalized.message,
        errorSource: normalized.errorSource,
        ...(req.requestId !== undefined ? { requestId: req.requestId } : {}),
        ...(err instanceof Error && err.stack !== undefined ? { stack: err.stack } : {})
    });
};
