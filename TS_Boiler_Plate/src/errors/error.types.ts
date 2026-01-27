export type TErrorSource = {
    path: string | number;
    message: string;
}[];

export type TGenericErrorResponse = {
    success: false;
    message: string;
    errorSource: TErrorSource;
    stack?: string;
    requestId?: string;
};
