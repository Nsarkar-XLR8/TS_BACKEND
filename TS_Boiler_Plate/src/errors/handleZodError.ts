import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import AppError from "./AppError.js";


export function handleZodError(err: ZodError): AppError {
    const errorSource = err.issues.map((i) => ({
        path: i.path.length ? i.path.join(".") : "body",
        message: i.message
    }));

    return AppError.of(StatusCodes.UNPROCESSABLE_ENTITY, "Validation failed", errorSource);
}
