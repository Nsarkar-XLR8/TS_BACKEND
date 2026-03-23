import "../config/env.js";
import config from "../config/index.js";
import { logger } from "../config/logger.js";
import { connectDB, disconnectDB } from "../database/index.js";
import { connectRedis, disconnectRedis } from "../lib/redis.js";
import { initMessaging, logCapabilityReport } from "../messaging/index.js";
import { messageBus } from "../messaging/messageBus.js";
import { connectRabbitMQ, disconnectRabbitMQ } from "../queues/rabbitmq.js";
import { processPaymentJob } from "./processors/paymentJobs.js";

await connectDB();
await connectRedis(config.redis.url);
await connectRabbitMQ(config.features.rabbitmqEnabled ? config.queues.rabbitmqUrl : undefined);
initMessaging();
logCapabilityReport();

await messageBus.subscribe(
    "commands.notifications",
    async (payload) => {
        await processPaymentJob("commands.notifications", payload);
    },
    { transport: "rabbitmq" }
);

logger.info("RabbitMQ consumer worker is running");

const shutdown = async () => {
    await disconnectRabbitMQ();
    await disconnectRedis();
    await disconnectDB();
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
