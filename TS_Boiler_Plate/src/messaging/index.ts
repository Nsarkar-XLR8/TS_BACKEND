import config from "../config/index.js";
import { logger } from "../config/logger.js";
import { initBullMQ } from "../queues/bullmq.js";
import { isKafkaReady } from "../queues/kafka.js";
import { isRabbitReady } from "../queues/rabbitmq.js";
import { messageBus } from "./messageBus.js";

export function initMessaging(): void {
    initBullMQ(config.features.bullmqEnabled ? config.redis.url : undefined);

    logger.info(
        {
            flags: config.features,
            redisConfigured: Boolean(config.redis.url),
            kafkaConfigured: Boolean(config.queues.kafkaBrokers),
            rabbitConfigured: Boolean(config.queues.rabbitmqUrl),
        },
        "Messaging feature flags loaded"
    );
}

export function logCapabilityReport(): void {
    logger.info(
        {
            capabilities: messageBus.getCapabilities(),
            providerReady: {
                kafka: isKafkaReady(),
                rabbitmq: isRabbitReady(),
            },
        },
        "Capability report"
    );
}
