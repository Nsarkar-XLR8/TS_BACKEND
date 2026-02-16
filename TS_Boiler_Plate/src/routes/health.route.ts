import { Router } from "express";
import { isDbReady } from "../config/connectDB.js";

export const healthRouter = Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Health check
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: OK
 */
healthRouter.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: "OK",
        data: {
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }
    });
});

healthRouter.get("/ready", (_req, res) => {
    const ready = isDbReady();
    res.status(ready ? 200 : 503).json({
        success: ready,
        statusCode: ready ? 200 : 503,
        message: ready ? "READY" : "NOT_READY",
        data: { db: ready }
    });
});
