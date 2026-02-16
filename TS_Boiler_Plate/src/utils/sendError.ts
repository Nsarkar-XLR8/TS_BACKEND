import type { Response } from "express";
import type { TErrorSource, TGenericErrorResponse } from "../errors/error.types.js";

type SendErrorArgs = {
    res: Response;
    statusCode: number;
    code: string;
    message: string;
    errorSource: TErrorSource;
    requestId?: string;
    stack?: string;
};

function isDevLikeEnv() {
    const env = (process.env.NODE_ENV ?? "development").toLowerCase();
    return env === "development" || env === "test";
}

export function sendError(args: SendErrorArgs) {
    const { res, statusCode, code, message, errorSource, requestId, stack } = args;

    const payload: TGenericErrorResponse = {
        success: false,
        code,
        message,
        errorSource
    };

    if (requestId !== undefined) payload.requestId = requestId;

    // Only include stack in dev/test
    if (isDevLikeEnv() && stack !== undefined) payload.stack = stack;

    return res.status(statusCode).json(payload);
}
