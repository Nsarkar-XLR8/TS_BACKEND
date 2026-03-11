import { Pool } from "pg";
import { logger } from "../../config/logger.js";

let pool: Pool;

export async function connectDB(uri: string) {
    try {
        pool = new Pool({
            connectionString: uri,
        });

        await pool.query('SELECT 1'); // Simple query to verify connection
        logger.info("✅ Postgres connected");
    } catch (err) {
        logger.error({ err }, "❌ Postgres connection failed");
        process.exit(1);
    }
}

export async function disconnectDB() {
    if (pool) {
        await pool.end();
        logger.info("Postgres disconnected");
    }
}

export function isDbReady() {
    return !!pool;
}

export default { connectDB, disconnectDB, isDbReady };
