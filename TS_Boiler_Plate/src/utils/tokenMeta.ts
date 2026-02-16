import ms from "ms";
import config from "../config/index.js";

function toSeconds(input: string) {
    const value = ms(input as ms.StringValue); // ✅ cast to satisfy typings

    if (typeof value !== "number") {
        throw new TypeError(`Invalid duration format: ${input}`);
    }

    return Math.floor(value / 1000);
}

export function getAuthTokenMeta() {
    return {
        tokenType: "Bearer" as const,
        expiresIn: toSeconds(config.jwt.jwtExpiresIn),
        refreshExpiresIn: toSeconds(config.jwt.refreshExpiresIn),
    };
}
