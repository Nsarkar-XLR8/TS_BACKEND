import { StatusCodes } from "http-status-codes";
import AppError from "./AppError.js";


export function handleJsonSyntaxError(_err: SyntaxError): AppError {
    return AppError.of(StatusCodes.BAD_REQUEST, "Invalid JSON payload", [
        { path: "body", message: "Malformed JSON" }
    ]);
}
