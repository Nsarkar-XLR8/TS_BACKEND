import { StatusCodes } from "http-status-codes";
import AppError from "./AppError.js";


type JwtLikeError = {
    name?: string;
    message?: string;
};

export function handleJwtError(err: unknown): AppError {
    const e = err as JwtLikeError;

    if (e.name === "TokenExpiredError") {
        return AppError.of(StatusCodes.UNAUTHORIZED, "Token expired", [
            { path: "authorization", message: "Please login again" }
        ]);
    }

    return AppError.of(StatusCodes.UNAUTHORIZED, "Invalid token", [
        { path: "authorization", message: "Token is invalid" }
    ]);
}
