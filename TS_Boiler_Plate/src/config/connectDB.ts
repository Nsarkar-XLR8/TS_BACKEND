import mongoose from "mongoose";
import { logger } from "./logger.js";




export async function connectDB(uri: string) {
    try {
        mongoose.set("strictQuery", true);

        // Let Mongoose handle the connection with a 5-second timeout
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });

        logger.info("✅ MongoDB connected");
    } catch (err) {
        logger.error({ err }, "❌ MongoDB connection failed");
        process.exit(1); // Exit immediately so the terminal doesn't hang
    }
}

export async function disconnectDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        logger.info("MongoDB disconnected");
    }
}

export function isDbReady() {
    return mongoose.connection.readyState === 1;
}

export default { connectDB, disconnectDB, isDbReady };