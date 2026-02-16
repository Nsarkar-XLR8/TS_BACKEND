/* eslint-disable @typescript-eslint/no-explicit-any */
import multer from "multer";
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError.js";


const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
]);

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) return cb(null, true);

    return cb(
        AppError.of(StatusCodes.UNPROCESSABLE_ENTITY, "Unsupported file type", [
            { path: file.fieldname, message: `Unsupported mimetype: ${file.mimetype}` }
        ]) as any,
        false
    );
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});
