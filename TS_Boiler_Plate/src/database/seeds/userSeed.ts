/**
 * Seed: Default admin user.
 *
 * Inserts a default admin user if one does not already exist.
 * Customize the data below to match your User model.
 */
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "../../config/index.js";
import { logger } from "../../config/logger.js";

export async function seedUsers(): Promise<void> {
    const db = mongoose.connection.db;
    if (!db) {
        logger.error("seedUsers: No database connection available.");
        return;
    }

    const usersCollection = db.collection("users");
    const existing = await usersCollection.findOne({ role: "admin" });

    if (existing) {
        logger.info("⏭️  Admin user already exists — skipping seed.");
        return;
    }

    const hashedPassword = await bcrypt.hash("ChangeMe123!", config.bcryptSaltRounds);

    await usersCollection.insertOne({
        name: "Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    logger.info("✅ Seeded default admin user (admin@example.com).");
}
