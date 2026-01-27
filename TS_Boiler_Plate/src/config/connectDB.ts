import mongoose from "mongoose";
import logger from "./logger";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function connectDB(uri: string, retries = 10) {
    mongoose.set("strictQuery", true);

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(uri);
            logger.info(
                { host: mongoose.connection.host, name: mongoose.connection.name },
                "MongoDB connected"
            );
            return;
        } catch (err) {
            logger.error({ err, attempt }, "MongoDB connect failed");
            if (attempt === retries) throw err;
            await sleep(1500);
        }
    }
}

export async function disconnectDB() {
    await mongoose.connection.close();
    logger.info("MongoDB disconnected");
}

export function isDbReady() {
    return mongoose.connection.readyState === 1;
}

export default { connectDB, disconnectDB, isDbReady };