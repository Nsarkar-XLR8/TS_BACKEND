import { createApp } from "./app";
import config from "./config"; // if you have it, else use process.env
import { logger } from "./config/logger";

const app = createApp();
const port = Number((config as any)?.port ?? process.env.PORT ?? 3000);

const server = app.listen(port, () => {
    logger.info({ port }, "Server started at http://localhost:%d", port);
});

let isShuttingDown = false;

async function shutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.warn({ signal }, "Shutdown initiated");

    // Stop accepting new connections
    server.close(async (err) => {
        if (err) {
            logger.error({ err }, "Error closing HTTP server");
            process.exit(1);
        }

        try {
            // TODO: close DB / Redis / queues here (later)
            // await mongoose.connection.close();
            // await redis.quit();

            logger.info("Shutdown complete");
            process.exit(0);
        } catch (e) {
            logger.error({ err: e }, "Shutdown failed");
            process.exit(1);
        }
    });

    // Hard timeout fallback (avoid hanging forever)
    setTimeout(() => {
        logger.error("Force exiting after timeout");
        process.exit(1);
    }, 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Catch unhandled errors (log then shutdown)
process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection");
    shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
    logger.error({ err }, "Uncaught exception");
    shutdown("uncaughtException");
});
