import config from "../config/index.js";
import { logger } from "../config/logger.js";
import { connectDB as connectMongo, disconnectDB as disconnectMongo, isDbReady as isMongoReady } from "./mongoDb/connect.js";
import { connectDB as connectPostgres, disconnectDB as disconnectPostgres, isDbReady as isPostgresReady } from "./postgres/connect.js";
import { connectDB as connectMysql, disconnectDB as disconnectMysql, isDbReady as isMysqlReady } from "./mysql/connect.js";

export async function connectDB() {
    const dbType = config.dbType;
    logger.info(`Starting DB connection for type: ${dbType}`);
    
    switch (dbType) {
        case "mongodb":
            if (!config.mongodbUrl) {
                logger.error("❌ MONGODB_URL is missing in environment variables.");
                process.exit(1);
            }
            await connectMongo(config.mongodbUrl);
            break;
        case "postgres":
            if (!config.postgresUrl) {
                logger.error("❌ POSTGRES_URL is missing in environment variables.");
                process.exit(1);
            }
            await connectPostgres(config.postgresUrl);
            break;
        case "mysql":
            if (!config.mysqlUrl) {
                logger.error("❌ MYSQL_URL is missing in environment variables.");
                process.exit(1);
            }
            await connectMysql(config.mysqlUrl);
            break;
        default:
            logger.error(`❌ Unsupported DB_TYPE: ${dbType}`);
            process.exit(1);
    }
}

export async function disconnectDB() {
    const dbType = config.dbType;
    switch (dbType) {
        case "mongodb":
            await disconnectMongo();
            break;
        case "postgres":
            await disconnectPostgres();
            break;
        case "mysql":
            await disconnectMysql();
            break;
    }
}

export function isDbReady() {
    const dbType = config.dbType;
    switch (dbType) {
        case "mongodb":
            return isMongoReady();
        case "postgres":
            return isPostgresReady();
        case "mysql":
            return isMysqlReady();
        default:
            return false;
    }
}

export default { connectDB, disconnectDB, isDbReady };
