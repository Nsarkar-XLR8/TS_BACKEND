export function pick<T extends Record<string, unknown>, K extends readonly (keyof T)[]>(
    obj: T,
    keys: K
): Pick<T, K[number]> {
    const out = {} as Pick<T, K[number]>;
    for (const key of keys) {
        if (Object.hasOwn(obj, key)) {
            out[key] = obj[key];
        }
    }
    return out;
}
