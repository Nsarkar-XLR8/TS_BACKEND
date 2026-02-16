import { StatusCodes } from "http-status-codes";
import AppError from "./AppError.js";


type MongooseCastErrorLike = {
    name?: string;
    path?: string;
    value?: unknown;
};

export function handleCastError(err: unknown): AppError {
    const e = err as MongooseCastErrorLike;
    const path = e.path ?? "field";
    const value = e.value;

    return AppError.of(StatusCodes.BAD_REQUEST, "Invalid value", [
        { path, message: `Invalid ${path}: ${String(value)}` }
    ]);
}
