import "./config/env";
import { createApp } from "./app";
import { connectDB, disconnectDB } from "./config/connectDb";
import logger from "./config/logger";


const app = createApp();
const port = Number(process.env.PORT ?? 5000);

async function bootstrap() {
    // Connect DB first (or you can start server first, your choice)
    await connectDB(process.env.MONGODB_URL!);

    const server = app.listen(port, () => {
        logger.info({ port }, "Server started at http://localhost:5000");
    });

    let isShuttingDown = false;

    async function shutdown(signal: string) {
        if (isShuttingDown) return;
        isShuttingDown = true;

        logger.warn({ signal }, "Shutdown initiated");

        server.close(async (err) => {
            if (err) {
                logger.error({ err }, "Error closing HTTP server");
                process.exit(1);
            }

            try {
                await disconnectDB();
                logger.info("Shutdown complete");
                process.exit(0);
            } catch (e) {
                logger.error({ err: e }, "Shutdown failed");
                process.exit(1);
            }
        });

        setTimeout(() => process.exit(1), 10_000).unref();
    }

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("unhandledRejection", (reason) => {
        logger.error({ reason }, "Unhandled promise rejection");
        shutdown("unhandledRejection");
    });
    process.on("uncaughtException", (err) => {
        logger.error({ err }, "Uncaught exception");
        shutdown("uncaughtException");
    });
}

bootstrap().catch((err) => {
    logger.error({ err }, "Startup failed");
    process.exit(1);
});
