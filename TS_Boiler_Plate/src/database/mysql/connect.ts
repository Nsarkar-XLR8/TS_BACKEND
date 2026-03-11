import mysql, { Pool } from "mysql2/promise";
import { logger } from "../../config/logger.js";

let pool: Pool;

export async function connectDB(uri: string) {
    try {
        pool = mysql.createPool(uri);
        const connection = await pool.getConnection();
        connection.release(); // Test and release connection
        
        logger.info("✅ MySQL connected");
    } catch (err) {
        logger.error({ err }, "❌ MySQL connection failed");
        process.exit(1);
    }
}

export async function disconnectDB() {
    if (pool) {
        await pool.end();
        logger.info("MySQL disconnected");
    }
}

export function isDbReady() {
    return !!pool;
}

export default { connectDB, disconnectDB, isDbReady };
