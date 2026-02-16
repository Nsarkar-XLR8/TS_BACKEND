import multer from "multer";
import { StatusCodes } from "http-status-codes";
import AppError from "./AppError.js";

const multerCodeMessage: Record<string, string> = {
    LIMIT_FILE_SIZE: "File too large",
    LIMIT_FILE_COUNT: "Too many files",
    LIMIT_FIELD_KEY: "Field name too long",
    LIMIT_FIELD_VALUE: "Field value too long",
    LIMIT_FIELD_COUNT: "Too many fields",
    LIMIT_PART_COUNT: "Too many parts",
    LIMIT_UNEXPECTED_FILE: "Unexpected file field"
};

export function handleMulterError(err: multer.MulterError): AppError {
    const message = multerCodeMessage[err.code] ?? "Invalid file upload";
    const path = err.field ?? "file";

    const statusCode =
        err.code === "LIMIT_FILE_SIZE"
            ? StatusCodes.REQUESTED_RANGE_NOT_SATISFIABLE
            : StatusCodes.UNPROCESSABLE_ENTITY;

    return AppError.of(statusCode, message, [{ path, message }]);
}
