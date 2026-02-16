import { pick } from "./pick.js";
import { buildPagination, type PaginationResult, type PaginationInput } from "./pagination.js";

/**
 * ELITE UTILITY: API Features
 *
 * This utility centralizes the logic for parsing query parameters into
 * structured filters, search, and pagination. It decouples the raw Express
 * query object from your database logic.
 */

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
    /** Filters to be applied directly to the DB query (e.g., MongoDB filter object) */
    filters: Record<string, unknown>;
    /** Unified search context */
    search?: { term: string; fields: readonly string[] };
    /** Standardized pagination metadata and sort object */
    pagination: PaginationResult;
    /** Specific fields requested by the client for partial responses */
    fields?: string[];
};

/**
 * Parses a comma-separated string of fields into an array.
 */
function parseFields(fields?: unknown): string[] | undefined {
    if (typeof fields !== "string") return undefined;
    const list = fields
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return list.length > 0 ? list : undefined;
}

/**
 * Standardizes the type conversion for query parameters.
 */
function toNumeric(val: unknown): number | undefined {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
        const parsed = Number(val);
        return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
}

/**
 * core building block for list endpoints.
 * It takes raw request query data and options to return a clean, typed query structure.
 */
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

    // 1. Extract Search and Fields
    const searchTerm = typeof query.searchTerm === "string" ? query.searchTerm.trim() : "";
    const requestedFields = parseFields(query.fields);

    // 2. Normalize Pagination Inputs
    const paginationInput: PaginationInput = {};
    const page = toNumeric(query.page);
    const limit = toNumeric(query.limit);

    if (page !== undefined) paginationInput.page = page;
    if (limit !== undefined) paginationInput.limit = limit;
    if (typeof query.sortBy === "string") paginationInput.sortBy = query.sortBy;
    if (query.sortOrder === "asc" || query.sortOrder === "desc") {
        paginationInput.sortOrder = query.sortOrder;
    }

    // 3. Build Filtration (Only allowed fields)
    const filters = pick(query, filterableFields as unknown as (keyof Record<string, unknown>)[]);

    // 4. Build Pagination and Sort
    const pagination = buildPagination(paginationInput, {
        defaultLimit,
        maxLimit,
        defaultSortBy,
        defaultSortOrder,
        ...(allowedSortBy === undefined ? {} : { allowedSortBy })
    });

    // 5. Assemble Result
    const result: ApiQueryResult = { filters, pagination };

    if (searchTerm && searchableFields.length > 0) {
        result.search = { term: searchTerm, fields: searchableFields };
    }

    if (requestedFields) {
        result.fields = requestedFields;
    }

    return result;
}
