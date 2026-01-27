import { Router } from "express";

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
