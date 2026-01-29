import "./config/env";
import { createApp } from "./app";
import { connectDB, disconnectDB } from "./config/connectDB";
import logger from "./config/logger";
import { Server } from "node:http";
import config from "./config";
// --- 1. ENHANCED ERROR CATCHING ---
const handleFatalError = (err: any, type: string) => {
    // We log the FULL error stack here
    console.error(`\n=== FATAL ${type} ===`);
    console.error(err);
    console.error(`=========================\n`);

    // Delay exit so you can read the error in PowerShell
    setTimeout(() => process.exit(1), config.port);
};

process.on("uncaughtException", (err) => handleFatalError(err, "EXCEPTION"));
process.on("unhandledRejection", (reason) => handleFatalError(reason, "REJECTION"));

const app = createApp();
// const port = Number(process.env.PORT ?? 5000);

// async function bootstrap() {
//     await connectDB(process.env.MONGODB_URL!);

//     const server: Server = app.listen(config.port, () => {
//         logger.info(`🚀 Server ready at http://localhost:${config.port}`);
//     });

//     const shutdown = (signal: string) => {
//         logger.warn(`\n[${signal}] - Graceful shutdown initiated.`);

//         // 1. Immediately kill idle 'Keep-Alive' connections 
//         // This is what prevents the terminal from hanging!
//         if (typeof server.closeAllConnections === 'function') {
//             server.closeAllConnections();
//         }

//         // 2. Stop accepting new requests
//         server.close(async (err?: Error) => {
//             if (err) {
//                 logger.error({ err }, "Error during server close");
//                 process.exit(1);
//             }

//             try {
//                 // 3. Close DB connection
//                 await disconnectDB();
//                 logger.info("✅ All systems shut down cleanly.");
//                 process.exit(0);
//             } catch (dbErr) {
//                 logger.error({ dbErr }, "Error closing database");
//                 process.exit(1);
//             }
//         });

//         // 4. Force-kill if it takes too long (the safety valve)
//         setTimeout(() => {
//             logger.fatal("Forcefully shutting down (timeout reached).");
//             process.exit(1);
//         }, 3000).unref();
//     };

//     process.on("SIGINT", () => shutdown("SIGINT"));
//     process.on("SIGTERM", () => shutdown("SIGTERM"));
// }


async function bootstrap() {
    try {
        await connectDB(process.env.MONGODB_URL!);

        const server: Server = app.listen(config.port, () => {
            logger.info(`🚀 Server ready at http://localhost:${config.port}`);
        });

        // Graceful Shutdown
        const shutdown = (signal: string) => {
            logger.warn(`\n[${signal}] - Shutting down.`);

            // Kill idle connections immediately to prevent terminal hang
            if (server.closeAllConnections) server.closeAllConnections();

            server.close(async (err?: Error) => {
                await disconnectDB();
                process.exit(err ? 1 : 0);
            });

            // Force exit after 2s if it gets stuck
            setTimeout(() => process.exit(1), 2000).unref();
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));

    } catch (err) {
        logger.error({ err }, "Bootstrap failed");
        process.exit(1);
    }
}

bootstrap();