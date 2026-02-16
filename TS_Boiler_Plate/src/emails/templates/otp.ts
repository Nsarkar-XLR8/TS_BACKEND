import type { EmailRenderResult, OtpTemplatePayload } from "../types.js";
import { layout, e } from "./layout.js";

export function renderOtpEmail(payload: OtpTemplatePayload, opts: { appName: string }): EmailRenderResult {
    const title = "Your verification code";
    const nameLine = payload.name ? `Hi ${e(payload.name)},` : "Hi,";
    const support = payload.supportEmail ? e(payload.supportEmail) : "";

    const bodyHtml = `
    <div style="color:#111827;font-size:16px;font-weight:700;margin-bottom:12px;">${title}</div>
    <div style="color:#374151;font-size:14px;line-height:20px;margin-bottom:16px;">${nameLine}<br/>Use the OTP below to continue.</div>

    <div style="background:#f3f4f6;border-radius:10px;padding:14px 16px;display:inline-block;font-size:22px;letter-spacing:4px;font-weight:800;color:#111827;">
      ${e(payload.otp)}
    </div>

    <div style="color:#374151;font-size:13px;line-height:18px;margin-top:16px;">
      This code will expire in <b>${payload.expiresInMinutes}</b> minutes.
    </div>

    ${support ? `<div style="color:#6b7280;font-size:12px;margin-top:18px;">Need help? Contact ${support}</div>` : ""}
  `;

    const { html, textHeader } = layout({
        appName: opts.appName,
        title,
        preheader: `Your OTP is ${payload.otp}`,
        bodyHtml
    });

    const text =
        textHeader +
        `${payload.name ? `Hi ${payload.name},` : "Hi,"}\n` +
        `Your OTP is: ${payload.otp}\n` +
        `Expires in: ${payload.expiresInMinutes} minutes\n` +
        (payload.supportEmail ? `Support: ${payload.supportEmail}\n` : "");

    return { subject: title, html, text };
}
