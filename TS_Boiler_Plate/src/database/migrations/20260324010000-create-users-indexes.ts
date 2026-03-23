/**
 * Migration: Create indexes on the users collection.
 *
 * This is an example migration showing the pattern.
 * Customize for your actual schema needs.
 */
import type { Db } from "mongodb";

export async function up(db: Db): Promise<void> {
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ createdAt: -1 });
}

export async function down(db: Db): Promise<void> {
    await db.collection("users").dropIndex("email_1");
    await db.collection("users").dropIndex("createdAt_-1");
}
