import type { Response } from "express";

export type PaginationMeta = {
    limit: number;
    page: number;
    total: number;
    totalPage: number;
};

export type SuccessResponse<TData, TExtras extends Record<string, unknown> = Record<string, unknown>> = {
    success?: boolean;
    statusCode: number;
    message: string;
    data?: TData;
    meta?: PaginationMeta;
    requestId?: string;
    extras?: TExtras; // stays nested to avoid collisions
};

export function sendResponse<TData, TExtras extends Record<string, unknown> = Record<string, unknown>>(
    res: Response,
    payload: SuccessResponse<TData, TExtras>
) {
    const { statusCode, message, data, meta, requestId, extras } = payload;

    const headerRequestId = res.getHeader("x-request-id");
    const resolvedRequestId =
        requestId ??
        (typeof headerRequestId === "string" && headerRequestId.length > 0 ? headerRequestId : undefined);

    return res.status(statusCode).json({
        success: true as const,
        // Optional: include or remove statusCode depending on your API standard
        statusCode,
        message,
        ...(resolvedRequestId ? { requestId: resolvedRequestId } : {}),
        ...(data === undefined ? {} : { data }),
        ...(meta === undefined ? { meta } : {}),
        ...(extras === undefined ? { extras } : {}),
    });
}
