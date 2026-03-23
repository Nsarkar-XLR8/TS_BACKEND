/**
 * Export OpenAPI Spec
 *
 * Writes the in-memory OpenAPI spec to a JSON file so that Spectral CLI
 * can validate it offline (e.g., in CI).
 *
 * Usage: npx tsx scripts/export-openapi.ts
 */
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dynamic import to avoid triggering dotenv/db connections at module level
const { openapiSpec } = await import("../src/config/swagger.js");

const outputPath = resolve(__dirname, "..", "openapi.json");
writeFileSync(outputPath, JSON.stringify(openapiSpec, null, 2), "utf-8");

console.log(`✅ OpenAPI spec exported to ${outputPath}`);
