import fs from "node:fs";
import path from "node:path";

function toPascalCase(input: string): string {
    return input
        .split(/[-_ ]+/)
        .filter(Boolean)
        .map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase())
        .join("");
}

const moduleName = process.argv[2];
if (!moduleName) {
    console.error("Usage: npm run scaffold:module -- <module-name>");
    process.exit(1);
}

const moduleDir = path.join(process.cwd(), "src", "modules", moduleName);
if (fs.existsSync(moduleDir)) {
    console.error(`Module already exists: ${moduleDir}`);
    process.exit(1);
}

fs.mkdirSync(moduleDir, { recursive: true });

const pascal = toPascalCase(moduleName);

const files: Record<string, string> = {
    [`${moduleName}.route.ts`]: `import { Router } from "express";
import validateRequest from "@/middlewares/validateRequest.js";
import { ${pascal}Validation } from "./${moduleName}.validation.js";
import { ${pascal}Controller } from "./${moduleName}.controller.js";

const router = Router();

router.post(
    "/",
    validateRequest(${pascal}Validation.createSchema),
    ${pascal}Controller.create
);

export const ${pascal}Routes = router;
`,
    [`${moduleName}.controller.ts`]: `import { StatusCodes } from "http-status-codes";
import catchAsync from "@/utils/catchAsync.js";
import { sendResponse } from "@/utils/sendResponse.js";
import { ${pascal}Service } from "./${moduleName}.service.js";

const create = catchAsync(async (req, res) => {
    const result = await ${pascal}Service.create(req.validated?.body ?? {});
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: "${pascal} created",
        data: result,
    });
});

export const ${pascal}Controller = { create };
`,
    [`${moduleName}.service.ts`]: `import { messageBus } from "@/messaging/messageBus.js";

const create = async (payload: Record<string, unknown>) => {
    await messageBus.publish({
        name: "${moduleName}.created",
        kind: "event",
        payload,
    });
    return payload;
};

export const ${pascal}Service = { create };
`,
    [`${moduleName}.validation.ts`]: `import { z } from "zod";

const createSchema = z.object({
    body: z.object({
        name: z.string().min(1),
    }).strict(),
});

export const ${pascal}Validation = { createSchema };
`,
    [`${moduleName}.events.ts`]: `export const ${pascal}Events = {
    CREATED: "${moduleName}.created",
} as const;
`,
    [`${moduleName}.jobs.ts`]: `export const ${pascal}Jobs = {
    SYNC: "${moduleName}.sync",
} as const;
`,
    [`${moduleName}.test.ts`]: `import { describe, it, expect } from "vitest";

describe("${pascal} module scaffold", () => {
    it("should be generated", () => {
        expect(true).toBe(true);
    });
});
`,
};

for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(moduleDir, name), content, "utf8");
}

console.log(`Module scaffold created at: ${moduleDir}`);
