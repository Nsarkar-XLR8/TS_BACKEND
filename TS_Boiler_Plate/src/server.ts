import { otelSdk } from "./observability/otel.js"; // This side-effect import must be ABSOLUTELY FIRST to patch modules
import "./config/env.js";
import { Server } from "node:http";
import { createApp } from "./app.js";
import { logger } from "./config/logger.js";
import { connectDB, disconnectDB } from "./database/index.js";
import config from "./config/index.js";
import { connectRedis, disconnectRedis } from "./lib/redis.js";

import { connectKafka, disconnectKafka } from "./queues/kafka.js";
import { connectRabbitMQ, disconnectRabbitMQ } from "./queues/rabbitmq.js";
import { startJobs, stopJobs } from "./jobs/index.js";
import { cleanExpiredOtpJob } from "./jobs/examples/cleanExpiredOtp.js";
import { initPassport } from "./auth/passport.js";


const app = createApp();

// Init passport strategies
initPassport();

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

    // Stop cron jobs
    stopJobs();

    // 1. Close idle connections to release the port immediately
    if (server) {
        if (server.closeAllConnections) server.closeAllConnections();

        // 2. Stop the server
        server.close(async (err) => {
            if (err) {
                logger.error({ err }, "Server close error");
                process.exit(1);
            }

            try {
                // 3. Disconnect Queues and DBs
                await disconnectKafka();
                await disconnectRabbitMQ();
                await disconnectRedis();
                await disconnectDB();

                // 4. Shutdown OTEL
                await otelSdk.shutdown();

                logger.info("Graceful shutdown successful.");
                process.exit(0);
            } catch (error_) {
                logger.error({ error_ }, "Shutdown sequence error");
                process.exit(1);
            }
        });
    } else {
        // If server wasn't started yet, try to cleanup OTEL at least
        otelSdk.shutdown().finally(() => process.exit(0));
    }

    // 5. Emergency force-exit (The Safety Valve)
    setTimeout(() => {
        logger.error("Shutdown timed out. Forcing exit.");
        process.exit(1);
    }, 2000).unref();
};

// Listen for termination signals in ALL environments
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));


try {
    await connectDB();
    await connectRedis(config.redis.url);
    await connectRabbitMQ(config.queues.rabbitmqUrl);
    await connectKafka(config.queues.kafkaBrokers);
    
    // Start Cron Jobs after DB is ready
    startJobs([cleanExpiredOtpJob]);

    server = app.listen(config.port, () => {
        logger.info({ port: config.port, env: config.nodeEnv }, "🚀 Server Synchronized");
    });
} catch (err) {
    logger.error({ err }, "Bootstrap sequence failed");
    process.exit(1);
}


