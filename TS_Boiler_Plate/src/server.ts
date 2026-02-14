import "./observability/otel"; // Must be first
import "./config/env";
import { createApp } from "./app";
import { connectDB, disconnectDB } from "./config/connectDB";
import { Server } from "node:http";
import config from "./config";
import { logger } from "./config/logger";

const app = createApp();

/**
 * Handles fatal errors that occur outside the Express context.
 * Uses a fixed 1s delay to allow the logger to flush.
 */
const handleFatalError = (err: unknown, type: string) => {
    logger.fatal({ err }, `FATAL ${type} DETECTED`);
    setTimeout(() => process.exit(1), 1000);
};

process.on("uncaughtException", (err) => handleFatalError(err, "EXCEPTION"));
process.on("unhandledRejection", (reason) => handleFatalError(reason, "REJECTION"));

async function bootstrap() {
    let server: Server;

    try {
        await connectDB(config.mongodbUrl);

        server = app.listen(config.port, () => {
            logger.info({ port: config.port, env: config.nodeEnv }, "🚀 Server Synchronized");
        });

        const shutdown = (signal: string) => {
            logger.warn(`[${signal}] - Initiating clean exit.`);

            // 1. Close idle connections to release the port immediately
            if (server && server.closeAllConnections) server.closeAllConnections();

            // 2. Stop the server
            server.close(async (err) => {
                try {
                    // 3. Close DB connection ONLY after server is stopped
                    await disconnectDB();
                    logger.info("Graceful shutdown successful.");
                    process.exit(err ? 1 : 0); // Force Exit Code 0 for success
                } catch (dbErr) {
                    logger.error(dbErr);
                    process.exit(1);
                }
            });

            // 4. Emergency force-exit (The Safety Valve)
            setTimeout(() => {
                logger.error("Shutdown timed out. Forcing exit.");
                process.exit(1);
            }, 4000).unref();
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));

    } catch (err) {
        logger.error({ err }, "Bootstrap sequence failed");
        process.exit(1);
    }
}

bootstrap();