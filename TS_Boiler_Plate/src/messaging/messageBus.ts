import config from "../config/index.js";
import { logger } from "../config/logger.js";
import { setIfNotExists } from "../lib/redis.js";
import { observeBusPublish, observeBusProcessing } from "../observability/metrics.js";
import { enqueueJob, getBullMQStatus, isBullMQReady, registerProcessor } from "../queues/bullmq.js";
import { isKafkaReady, publishEvent, subscribeToTopic } from "../queues/kafka.js";
import { consumeFromQueue, isRabbitReady, publishToQueue } from "../queues/rabbitmq.js";
import type { BusCapabilities, BusEvent, PublishOptions, SubscribeHandler } from "./types.js";

const DEFAULT_IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;

function shouldUseBullMQ(kind: BusEvent["kind"]) {
    return kind === "job";
}

function shouldUseRabbit(kind: BusEvent["kind"]) {
    return kind === "command";
}

function transportOrder(kind: BusEvent["kind"]) {
    if (shouldUseBullMQ(kind)) return ["bullmq", "rabbitmq", "kafka"] as const;
    if (shouldUseRabbit(kind)) return ["rabbitmq", "bullmq", "kafka"] as const;
    return ["kafka", "bullmq", "rabbitmq"] as const;
}

async function markIdempotent(idempotencyKey?: string) {
    if (!idempotencyKey) return true;
    return setIfNotExists(`idemp:bus:${idempotencyKey}`, "1", DEFAULT_IDEMPOTENCY_TTL_SECONDS);
}

class MessageBus {
    getCapabilities(): BusCapabilities {
        return {
            bullmq: config.features.bullmqEnabled && isBullMQReady(),
            kafka: config.features.kafkaEnabled && isKafkaReady(),
            rabbitmq: config.features.rabbitmqEnabled && isRabbitReady(),
        };
    }

    async publish(event: BusEvent, options?: PublishOptions): Promise<boolean> {
        if (!(await markIdempotent(event.idempotencyKey))) {
            logger.info({ event: event.name, idempotencyKey: event.idempotencyKey }, "Duplicate event skipped");
            return true;
        }

        const preferred = options?.transport;
        const candidates = preferred ? [preferred] : transportOrder(event.kind);

        for (const transport of candidates) {
            if (transport === "bullmq" && config.features.bullmqEnabled && isBullMQReady()) {
                const ok = await enqueueJob(
                    event.kind === "job" ? event.name : "events",
                    event.name,
                    {
                        ...event.payload,
                        eventName: event.name,
                        __meta: { requestId: event.requestId, idempotencyKey: event.idempotencyKey },
                    },
                    {
                        ...(options?.delayMs === undefined ? {} : { delay: options.delayMs }),
                        attempts: options?.retries ?? 3,
                        removeOnComplete: 1000,
                        removeOnFail: 5000,
                    }
                );
                if (ok) {
                    observeBusPublish("bullmq", event.name, true);
                    return true;
                }
            }

            if (transport === "kafka" && config.features.kafkaEnabled && isKafkaReady()) {
                await publishEvent(event.name, {
                    ...((event.idempotencyKey ?? event.requestId) === undefined
                        ? {}
                        : { key: event.idempotencyKey ?? event.requestId }),
                    value: {
                        ...event.payload,
                        eventName: event.name,
                        requestId: event.requestId,
                    },
                });
                observeBusPublish("kafka", event.name, true);
                return true;
            }

            if (transport === "rabbitmq" && config.features.rabbitmqEnabled && isRabbitReady()) {
                const sent = await publishToQueue(event.name, {
                    ...event.payload,
                    eventName: event.name,
                    requestId: event.requestId,
                });
                if (sent) {
                    observeBusPublish("rabbitmq", event.name, true);
                    return true;
                }
            }
        }

        observeBusPublish(preferred ?? "none", event.name, false);
        logger.warn({ event: event.name, kind: event.kind }, "No messaging transport available");
        return false;
    }

    async subscribe(
        topic: string,
        handler: SubscribeHandler,
        options?: { transport?: "bullmq" | "kafka" | "rabbitmq"; groupId?: string; concurrency?: number }
    ): Promise<void> {
        const wrappedHandler: SubscribeHandler = async (payload) => {
            const end = observeBusProcessing(options?.transport ?? "auto", topic);
            try {
                await handler(payload);
            } finally {
                end();
            }
        };

        const preferred = options?.transport;
        if ((!preferred || preferred === "bullmq") && config.features.bullmqEnabled && isBullMQReady()) {
            registerProcessor(
                topic,
                async (job) => wrappedHandler((job.data ?? {}) as Record<string, unknown>),
                { concurrency: options?.concurrency ?? 5 }
            );
            return;
        }

        if ((!preferred || preferred === "kafka") && config.features.kafkaEnabled && isKafkaReady()) {
            await subscribeToTopic(topic, options?.groupId ?? `group-${topic}`, wrappedHandler);
            return;
        }

        if ((!preferred || preferred === "rabbitmq") && config.features.rabbitmqEnabled && isRabbitReady()) {
            await consumeFromQueue(topic, wrappedHandler);
        }
    }

    health() {
        return {
            capabilities: this.getCapabilities(),
            bullmq: getBullMQStatus(),
        };
    }
}

export const messageBus = new MessageBus();
