import "../config/env.js";
import config from "../config/index.js";
import { logger } from "../config/logger.js";
import { connectDB, disconnectDB } from "../database/index.js";
import { connectRedis, disconnectRedis } from "../lib/redis.js";
import { initMessaging, logCapabilityReport } from "../messaging/index.js";
import { messageBus } from "../messaging/messageBus.js";
import { connectKafka, disconnectKafka } from "../queues/kafka.js";
import { processPaymentJob } from "./processors/paymentJobs.js";

await connectDB();
await connectRedis(config.redis.url);
await connectKafka(config.features.kafkaEnabled ? config.queues.kafkaBrokers : undefined);
initMessaging();
logCapabilityReport();

await messageBus.subscribe(
    "audit.events",
    async (payload) => {
        await processPaymentJob("audit.events", payload);
    },
    { transport: "kafka", groupId: "audit-consumer-group" }
);

logger.info("Kafka consumer worker is running");

const shutdown = async () => {
    await disconnectKafka();
    await disconnectRedis();
    await disconnectDB();
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
