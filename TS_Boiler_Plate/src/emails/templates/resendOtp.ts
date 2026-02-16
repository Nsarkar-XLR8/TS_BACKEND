import type { EmailRenderResult, OtpTemplatePayload } from "../types.js";
import { renderOtpEmail } from "./otp.js";

export function renderResendOtpEmail(payload: OtpTemplatePayload, opts: { appName: string }): EmailRenderResult {
    const base = renderOtpEmail(payload, opts);
    return {
        ...base,
        subject: "Your new verification code"
    };
}
