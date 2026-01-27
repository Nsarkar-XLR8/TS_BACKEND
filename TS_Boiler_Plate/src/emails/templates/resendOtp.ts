import type { EmailRenderResult, OtpTemplatePayload } from "../types";
import { renderOtpEmail } from "./otp";

export function renderResendOtpEmail(payload: OtpTemplatePayload, opts: { appName: string }): EmailRenderResult {
    const base = renderOtpEmail(payload, opts);
    return {
        ...base,
        subject: "Your new verification code"
    };
}
