import { Job, JobsOptions, Queue, QueueEvents, Worker } from "bullmq";
import { logger } from "../config/logger.js";

type Processor<T = Record<string, unknown>> = (job: Job<T>) => Promise<void>;
type ProcessorOptions = { concurrency?: number };

let enabled = false;
let connectionUrl: string | undefined;
const queues = new Map<string, Queue>();
const workers = new Map<string, Worker>();
const queueEvents = new Map<string, QueueEvents>();

export function initBullMQ(redisUrl?: string): void {
    if (!redisUrl) {
        enabled = false;
        connectionUrl = undefined;
        logger.info("BullMQ disabled (REDIS_URL missing)");
        return;
    }
    enabled = true;
    connectionUrl = redisUrl;
    logger.info("BullMQ enabled");
}

function getQueue(queueName: string): Queue | null {
    if (!enabled || !connectionUrl) return null;
    const existing = queues.get(queueName);
    if (existing) return existing;

    const queue = new Queue(queueName, { connection: { url: connectionUrl } });
    queues.set(queueName, queue);

    const events = new QueueEvents(queueName, { connection: { url: connectionUrl } });
    events.on("failed", ({ jobId, failedReason }) => {
        logger.error({ queueName, jobId, failedReason }, "BullMQ job failed");
    });
    events.on("completed", ({ jobId }) => {
        logger.debug({ queueName, jobId }, "BullMQ job completed");
    });
    queueEvents.set(queueName, events);

    return queue;
}

export async function enqueueJob<T = Record<string, unknown>>(
    queueName: string,
    jobName: string,
    payload: T,
    opts?: JobsOptions
): Promise<boolean> {
    const queue = getQueue(queueName);
    if (!queue) return false;
    await queue.add(jobName, payload, opts);
    return true;
}

export function registerProcessor<T = Record<string, unknown>>(
    queueName: string,
    processor: Processor<T>,
    options?: ProcessorOptions
): Worker | null {
    if (!enabled || !connectionUrl) return null;
    if (workers.has(queueName)) return workers.get(queueName) ?? null;

    const worker = new Worker<T>(queueName, processor, {
        connection: { url: connectionUrl },
        concurrency: options?.concurrency ?? 5,
    });

    worker.on("failed", (job, err) => {
        logger.error({ queueName, jobId: job?.id, err }, "BullMQ worker failed");
    });
    worker.on("completed", (job) => {
        logger.debug({ queueName, jobId: job.id }, "BullMQ worker completed");
    });

    workers.set(queueName, worker);
    return worker;
}

export async function closeBullMQ(): Promise<void> {
    for (const worker of workers.values()) {
        await worker.close();
    }
    workers.clear();

    for (const events of queueEvents.values()) {
        await events.close();
    }
    queueEvents.clear();

    for (const queue of queues.values()) {
        await queue.close();
    }
    queues.clear();
}

export function isBullMQReady(): boolean {
    return enabled && Boolean(connectionUrl);
}

export function getBullMQStatus() {
    return {
        enabled,
        connected: isBullMQReady(),
        queues: Array.from(queues.keys()),
        workers: Array.from(workers.keys()),
    };
}
