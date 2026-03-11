import cron from "node-cron";
import { logger } from "../config/logger.js";

export interface CronJob {
    name: string;
    schedule: string; // cron expression
    handler: () => Promise<void> | void;
    enabled?: boolean;
}

const registeredJobs: { name: string; task: cron.ScheduledTask }[] = [];

/**
 * Register and start all cron jobs.
 * Call this from server.ts after DB is connected.
 */
export function startJobs(jobs: CronJob[]): void {
    for (const job of jobs) {
        if (job.enabled === false) {
            logger.info({ job: job.name }, "⏭️  Cron job disabled, skipping");
            continue;
        }

        if (!cron.validate(job.schedule)) {
            logger.error({ job: job.name, schedule: job.schedule }, "Invalid cron expression");
            continue;
        }

        const task = cron.schedule(job.schedule, async () => {
            const start = Date.now();
            logger.info({ job: job.name }, "🕐 Cron job started");
            try {
                await job.handler();
                logger.info({ job: job.name, durationMs: Date.now() - start }, "✅ Cron job finished");
            } catch (err) {
                logger.error({ err, job: job.name }, "❌ Cron job failed");
            }
        });

        registeredJobs.push({ name: job.name, task });
        logger.info({ job: job.name, schedule: job.schedule }, "📋 Cron job registered");
    }
}

/**
 * Stop all registered cron jobs (for graceful shutdown).
 */
export function stopJobs(): void {
    for (const { name, task } of registeredJobs) {
        task.stop();
        logger.info({ job: name }, "Cron job stopped");
    }
    registeredJobs.length = 0;
}
