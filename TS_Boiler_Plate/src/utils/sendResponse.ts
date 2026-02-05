import type { Response } from "express";

export type PaginationMeta = {
    limit: number;
    page: number;
    total: number;
    totalPage: number;
};

export type SuccessResponse<TData, TExtras extends Record<string, unknown> = Record<string, never>> = {
    statusCode: number;
    success?: boolean;
    message: string;
    data?: TData;
    meta?: PaginationMeta;
    requestId?: string;

    /**
     * For feature-specific additions (analytics, recentOrders, etc.)
     * Keeps the envelope stable while allowing growth safely.
     */
    extras?: TExtras;
};

export function sendResponse<TData, TExtras extends Record<string, unknown> = Record<string, never>>(
    res: Response,
    payload: SuccessResponse<TData, TExtras>
) {
    const { statusCode, message, data, meta, requestId, extras } = payload;

    return res.status(statusCode).json({
        success: true,
        statusCode,
        message,
        ...(requestId !== undefined ? { requestId } : {}),
        ...(data !== undefined ? { data } : {}),
        ...(meta !== undefined ? { meta } : {}),
        ...(extras !== undefined ? extras : {})
    });
}
