import type { EmailRenderResult, ContactThanksPayload } from "../types.js";
import { layout, e } from "./layout.js";

export function renderContactThanksEmail(
    payload: ContactThanksPayload,
    opts: { appName: string }
): EmailRenderResult {
    const title = "Thanks for contacting us";
    const nameLine = payload.name ? `Hi ${e(payload.name)},` : "Hi,";
    const support = payload.supportEmail ? e(payload.supportEmail) : "";

    const ticketLine = payload.ticketId
        ? `<div style="color:#374151;font-size:13px;margin-top:10px;">Ticket ID: <b>${e(payload.ticketId)}</b></div>`
        : "";

    const preview = payload.messagePreview
        ? `<div style="margin-top:14px;color:#6b7280;font-size:12px;">Your message: “${e(payload.messagePreview)}”</div>`
        : "";

    const bodyHtml = `
    <div style="color:#111827;font-size:16px;font-weight:700;margin-bottom:12px;">${title}</div>
    <div style="color:#374151;font-size:14px;line-height:20px;">
      ${nameLine}<br/>
      We received your message and our team will respond as soon as possible.
      ${ticketLine}
      ${preview}
    </div>

    ${support ? `<div style="color:#6b7280;font-size:12px;margin-top:18px;">Need urgent help? Contact ${support}</div>` : ""}
  `;

    const { html, textHeader } = layout({
        appName: opts.appName,
        title,
        preheader: "We received your message",
        bodyHtml
    });

    const text =
        textHeader +
        `${payload.name ? `Hi ${payload.name},` : "Hi,"}\n` +
        `We received your message and will respond as soon as possible.\n` +
        (payload.ticketId ? `Ticket ID: ${payload.ticketId}\n` : "") +
        (payload.supportEmail ? `Support: ${payload.supportEmail}\n` : "");

    return { subject: title, html, text };
}
