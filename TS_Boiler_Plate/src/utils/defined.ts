export function defined<T extends Record<string, unknown>>(obj: T) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined) out[k] = v;
    }
    return out as { [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined> };
}
