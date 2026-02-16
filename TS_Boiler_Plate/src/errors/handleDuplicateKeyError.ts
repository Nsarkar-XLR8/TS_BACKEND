import { StatusCodes } from "http-status-codes";
import AppError from "./AppError.js";


type MongoDuplicateKeyLike = {
    code?: number;
    keyValue?: Record<string, unknown>;
};

export function handleDuplicateKeyError(err: unknown): AppError {
    const e = err as MongoDuplicateKeyLike;
    const entries = Object.entries(e.keyValue ?? {});

    const errorSource =
        entries.length > 0
            ? entries.map(([k, v]) => ({ path: k, message: `Duplicate value: "${String(v)}"` }))
            : [{ path: "general", message: "Duplicate key error" }];

    return AppError.of(StatusCodes.CONFLICT, "Duplicate key error", errorSource);
}
