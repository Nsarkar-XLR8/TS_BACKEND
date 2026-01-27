import { pick } from "./pick";
import { buildPagination, type PaginationResult, type PaginationInput } from "./pagination";

export type ApiFeaturesOptions = {
    searchableFields?: readonly string[];
    filterableFields?: readonly string[];
    allowedSortBy?: readonly string[];
    defaultSortBy?: string;
    defaultSortOrder?: "asc" | "desc";
    defaultLimit?: number;
    maxLimit?: number;
};

export type ApiQueryResult = {
    filters: Record<string, unknown>;
    search?: { term: string; fields: readonly string[] };
    pagination: PaginationResult;
    fields?: string[];
};

function parseFields(fields?: unknown): string[] | undefined {
    if (typeof fields !== "string") return undefined;
    const list = fields.split(",").map(s => s.trim()).filter(Boolean);
    return list.length > 0 ? list : undefined;
}

export function buildApiQuery(query: Record<string, unknown>, opts: ApiFeaturesOptions): ApiQueryResult {
    const {
        searchableFields = [],
        filterableFields = [],
        allowedSortBy,
        defaultSortBy = "createdAt",
        defaultSortOrder = "desc",
        defaultLimit = 10,
        maxLimit = 100
    } = opts;

    const searchTerm = typeof query.searchTerm === "string" ? query.searchTerm.trim() : "";
    const fields = parseFields(query.fields);

    const page = typeof query.page === "number" ? query.page : typeof query.page === "string" ? Number(query.page) : undefined;
    const limit = typeof query.limit === "number" ? query.limit : typeof query.limit === "string" ? Number(query.limit) : undefined;
    const sortBy = typeof query.sortBy === "string" ? query.sortBy : undefined;
    const sortOrder = query.sortOrder === "asc" || query.sortOrder === "desc" ? query.sortOrder : undefined;

    const filters = pick(query as Record<string, unknown>, filterableFields as unknown as (keyof Record<string, unknown>)[]);

    const paginationInput: PaginationInput = {};
    if (page !== undefined) paginationInput.page = page;
    if (limit !== undefined) paginationInput.limit = limit;
    if (sortBy !== undefined) paginationInput.sortBy = sortBy;
    if (sortOrder !== undefined) paginationInput.sortOrder = sortOrder;

    const pagination = buildPagination(paginationInput, {
        defaultLimit,
        maxLimit,
        defaultSortBy,
        defaultSortOrder,
        ...(allowedSortBy !== undefined ? { allowedSortBy } : {})
    });


    const result: ApiQueryResult = { filters, pagination };

    if (searchTerm && searchableFields.length > 0) {
        result.search = { term: searchTerm, fields: searchableFields };
    }

    if (fields) result.fields = fields;

    return result;
}
