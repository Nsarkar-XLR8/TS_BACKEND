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

let server: Server;

const shutdown = (signal: string) => {
    logger.info(`[${signal}] - Initiating clean exit.`);

    // 1. Close idle connections to release the port immediately
    if (server) {
        if (server.closeAllConnections) server.closeAllConnections();

        // 2. Stop the server
        server.close((err) => {
            if (err) {
                logger.error({ err }, "Server close error");
                process.exit(1);
            }

            disconnectDB().then(() => {
                logger.info("Graceful shutdown successful.");
                process.exit(0);
            }).catch((error_) => {
                logger.error({ error_ }, "DB disconnect error");
                process.exit(1);
            });
        });
    } else {
        // If server wasn't started yet, just exit
        process.exit(0);
    }

    // 4. Emergency force-exit (The Safety Valve)
    setTimeout(() => {
        logger.error("Shutdown timed out. Forcing exit.");
        process.exit(1);
    }, 1000).unref();
};

if (config.nodeEnv === "production") {
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
    try {
        await connectDB(config.mongodbUrl);
        server = app.listen(config.port, () => {
            logger.info({ port: config.port, env: config.nodeEnv }, "🚀 Server Synchronized");
        });
    } catch (err) {
        logger.error({ err }, "Bootstrap sequence failed");
        process.exit(1);
    }
})();