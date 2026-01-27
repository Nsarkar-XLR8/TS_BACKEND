export type EmailRenderResult = {
    subject: string;
    html: string;
    text: string;
};

export type OtpTemplatePayload = {
    name?: string;
    otp: string;
    expiresInMinutes: number;
    supportEmail?: string;
};

export type ContactThanksPayload = {
    name?: string;
    ticketId?: string;
    messagePreview?: string;
    supportEmail?: string;
};

export type TemplatePayloadMap = {
    otp: OtpTemplatePayload;
    resendOtp: OtpTemplatePayload;
    contactThanks: ContactThanksPayload;
};

export type TemplateName = keyof TemplatePayloadMap;

export type TemplatePayload = TemplatePayloadMap[TemplateName];