/**
 * migrate-mongo configuration
 *
 * This file is consumed by the `migrate-mongo` CLI.
 * It reads the MongoDB URL from the same env vars as the rest of the app.
 */
import dotenv from "dotenv";
dotenv.config();

const config = {
    mongodb: {
        url: process.env.MONGODB_URL || "mongodb://localhost:27017",
        databaseName:
            process.env.MONGODB_URL?.split("/").pop()?.split("?")[0] ||
            "ts_boilerplate",
        options: {
            // useNewUrlParser and useUnifiedTopology are default in modern drivers
        },
    },
    migrationsDir: "src/database/migrations",
    changelogCollectionName: "changelog",
    migrationFileExtension: ".ts",
    useFileHash: false,
    moduleSystem: "esm" as const,
};

export default config;
