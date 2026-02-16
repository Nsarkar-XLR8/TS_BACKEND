import { StatusCodes } from "http-status-codes";
import AppError from "./AppError.js";


type MongoServerErrorLike = {
    name?: string;
    code?: number;
    message?: string;
};

export function handleMongoServerError(err: unknown): AppError {
    const e = err as MongoServerErrorLike;

    return AppError.of(StatusCodes.BAD_GATEWAY, "Database error", [
        { path: "database", message: e.message ?? "MongoDB error" }
    ]);
}
