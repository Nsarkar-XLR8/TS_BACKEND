/**
 * Seed Runner
 *
 * Usage: npx tsx src/database/seeds/index.ts
 *
 * Connects to the database, runs all seed functions, then disconnects.
 * Add your seed functions to the `seeds` array below.
 */
import "../../config/env.js";
import mongoose from "mongoose";
import config from "../../config/index.js";
import { logger } from "../../config/logger.js";
import { seedUsers } from "./userSeed.js";

const seeds = [seedUsers];

if (!config.mongodbUrl) {
    logger.error("❌ MONGODB_URL is not set. Cannot run seeds.");
    process.exit(1);
}

try {
    await mongoose.connect(config.mongodbUrl);
    logger.info("🌱 Connected to MongoDB — running seeds...");

    for (const seed of seeds) {
        await seed();
    }

    logger.info("✅ All seeds completed.");
} catch (err) {
    logger.error({ err }, "❌ Seed runner failed.");
    process.exit(1);
} finally {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB.");
}
