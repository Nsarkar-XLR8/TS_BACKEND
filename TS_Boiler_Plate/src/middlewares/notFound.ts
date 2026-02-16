import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError.js";


export const notFound: RequestHandler = (req, _res, next) => {
    next(
        AppError.of(StatusCodes.NOT_FOUND, `Route not found: ${req.method} ${req.originalUrl}`, [
            { path: "route", message: `${req.method} ${req.originalUrl} does not exist` }
        ])
    );
};
