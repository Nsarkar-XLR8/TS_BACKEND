import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../utils/sendResponse.js";

export const rootRouter = Router();

rootRouter.get("/", (req, res) => {
    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "API is running",
        data: { name: "TS_Boiler_Plate", version: "1.0.0" },
        ...(req.requestId !== undefined ? { requestId: req.requestId } : {})
    });
});
