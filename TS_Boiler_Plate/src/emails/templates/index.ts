/* eslint-disable @typescript-eslint/no-explicit-any */
import type { EmailRenderResult, TemplateName, TemplatePayloadMap } from "../types.js";

import { renderOtpEmail } from "./otp.js";
import { renderResendOtpEmail } from "./resendOtp.js";
import { renderContactThanksEmail } from "./contactThanks.js";

const APP_NAME = process.env.APP_NAME ?? "TS Boilerplate";

/**
 * Strongly typed renderers map:
 * - Each key enforces the correct payload type for that template.
 * - No switch needed.
 */
const renderers: {
    [K in TemplateName]: (payload: TemplatePayloadMap[K], opts: { appName: string }) => EmailRenderResult;
} = {
    otp: (payload, opts) => renderOtpEmail(payload, opts),
    resendOtp: (payload, opts) => renderResendOtpEmail(payload, opts),
    contactThanks: (payload, opts) => renderContactThanksEmail(payload, opts)
};

export function renderTemplate<K extends TemplateName>(
    name: K,
    payload: TemplatePayloadMap[K]
): EmailRenderResult {
    const renderer = renderers[name];
    if (!renderer) {
        throw new Error(`Template renderer not found: ${name}`);
    }
    return (renderer as any)(payload, { appName: APP_NAME });
}
