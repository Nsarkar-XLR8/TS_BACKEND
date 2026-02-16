import { StatusCodes } from "http-status-codes";
import AppError from "./AppError.js";


type MongooseValidationErrorLike = {
    name?: string;
    errors?: Record<string, { path?: string; message?: string }>;
};

export function handleMongooseValidationError(err: unknown): AppError {
    const e = err as MongooseValidationErrorLike;

    const errorSource =
        e.errors
            ? Object.values(e.errors).map((x) => ({
                path: x.path ?? "field",
                message: x.message ?? "Invalid value"
            }))
            : [{ path: "general", message: "Validation failed" }];

    return AppError.of(StatusCodes.UNPROCESSABLE_ENTITY, "Validation failed", errorSource);
}
