export type TErrorSource = {
    path: string | number;
    message: string;
}[];

export type TGenericErrorResponse = {
    success: false;
    code: string;
    message: string;
    errorSource: TErrorSource;
    stack?: string;
    requestId?: string;
};
