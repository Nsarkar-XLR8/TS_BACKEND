import type { Request } from "express";

export function demo(req: Request) {
    // Should NOT error:
    req.user;

    // Should error (correctly) unless you guard:
    // req.user.sub
}
