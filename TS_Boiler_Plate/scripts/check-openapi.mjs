import fs from "node:fs";
import path from "node:path";

const specPath = path.join(process.cwd(), "openapi.json");

if (!fs.existsSync(specPath)) {
    console.error("openapi.json not found. Run `npm run export:openapi` first.");
    process.exit(1);
}

const raw = fs.readFileSync(specPath, "utf8");
let parsed;
try {
    parsed = JSON.parse(raw);
} catch (err) {
    console.error("openapi.json is not valid JSON", err);
    process.exit(1);
}

if (!parsed.openapi || !parsed.paths || typeof parsed.paths !== "object") {
    console.error("openapi.json is missing required top-level fields");
    process.exit(1);
}

console.log(`OpenAPI contract looks valid (${Object.keys(parsed.paths).length} paths).`);
