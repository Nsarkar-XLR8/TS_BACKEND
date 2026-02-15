import type { Request } from "express";

export function demo(_req: Request) {
    // Should NOT error:
    // req.user;

    // Should error (correctly) unless you guard:
    // req.user.sub
}
