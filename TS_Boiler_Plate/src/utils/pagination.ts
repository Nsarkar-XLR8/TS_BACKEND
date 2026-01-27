export type PaginationInput = {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
};

export type PaginationResult = {
    page: number;
    limit: number;
    skip: number;
    sortBy?: string | undefined;
    sortOrder: "asc" | "desc";
    sort: Record<string, 1 | -1>;
};

export function buildPagination(
    input: PaginationInput,
    options?: {
        defaultLimit?: number;
        maxLimit?: number;
        defaultSortBy?: string;
        defaultSortOrder?: "asc" | "desc";
        allowedSortBy?: readonly string[]; // if provided, validate sortBy
    }
): PaginationResult {
    const page = Number.isFinite(input.page) && (input.page as number) > 0 ? (input.page as number) : 1;

    const defaultLimit = options?.defaultLimit ?? 10;
    const maxLimit = options?.maxLimit ?? 100;

    const rawLimit =
        Number.isFinite(input.limit) && (input.limit as number) > 0 ? (input.limit as number) : defaultLimit;

    const limit = Math.min(rawLimit, maxLimit);
    const skip = (page - 1) * limit;

    const sortOrder: "asc" | "desc" = input.sortOrder === "asc" || input.sortOrder === "desc"
        ? input.sortOrder
        : options?.defaultSortOrder ?? "desc";

    let sortBy = input.sortBy ?? options?.defaultSortBy;

    if (sortBy && options?.allowedSortBy && !options.allowedSortBy.includes(sortBy)) {
        // silently fall back to default if invalid
        sortBy = options.defaultSortBy;
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    return { page, limit, skip, sortBy, sortOrder, sort };
}
