import { getReasonPhrase, StatusCodes } from "http-status-codes";
import type { TErrorSource } from "./error.types";

export interface AppErrorOptions {
    statusCode: number;
    message?: string;
    isOperational?: boolean;
    errorSource?: TErrorSource;
}

function buildOptions(
    statusCode: number,
    message?: string,
    errorSource?: TErrorSource,
    isOperational?: boolean
): AppErrorOptions {
    const opts: AppErrorOptions = { statusCode };

    if (message !== undefined) opts.message = message; // exactOptionalPropertyTypes-safe
    if (errorSource !== undefined) opts.errorSource = errorSource;
    if (isOperational !== undefined) opts.isOperational = isOperational;

    return opts;
}

class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly errorSource: TErrorSource;

    constructor({ statusCode, message, isOperational = true, errorSource }: AppErrorOptions) {
        super(message ?? getReasonPhrase(statusCode));

        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errorSource = errorSource ?? [{ path: "general", message: this.message }];

        Error.captureStackTrace(this, this.constructor);
    }

    static of(statusCode: number, message?: string, errorSource?: TErrorSource) {
        return new AppError(buildOptions(statusCode, message, errorSource));
    }

    static badRequest(message?: string, errorSource?: TErrorSource) {
        return new AppError(buildOptions(StatusCodes.BAD_REQUEST, message, errorSource));
    }

    static notFound(message?: string) {
        return new AppError(buildOptions(StatusCodes.NOT_FOUND, message));
    }

    static internal(message?: string) {
        return new AppError(
            buildOptions(
                StatusCodes.INTERNAL_SERVER_ERROR,
                message ?? "Internal Server Error",
                [{ path: "general", message: "Internal Server Error" }],
                false // non-operational
            )
        );
    }

    static unprocessableEntity(message?: string, errorSource?: TErrorSource) {
        // Operational: validation / bad input
        return new AppError(buildOptions(StatusCodes.UNPROCESSABLE_ENTITY, message ?? "Validation failed", errorSource, true));
    }
}
export default AppError;