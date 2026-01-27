function escapeHtml(input: string): string {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function layout(params: {
    appName: string;
    title: string;
    preheader?: string;
    bodyHtml: string;
    footerText?: string;
}): { html: string; textHeader: string } {
    const appName = escapeHtml(params.appName);
    const title = escapeHtml(params.title);
    const preheader = params.preheader ? escapeHtml(params.preheader) : "";
    const footerText = params.footerText ? escapeHtml(params.footerText) : "";

    // Simple, compatible, inline-ish styling (works across most clients)
    const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;">
      ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ""}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #eef0f4;">
                  <div style="font-size:16px;font-weight:700;color:#111827;">${appName}</div>
                </td>
              </tr>

              <tr>
                <td style="padding:24px;">
                  ${params.bodyHtml}
                </td>
              </tr>

              <tr>
                <td style="padding:16px 24px;border-top:1px solid #eef0f4;color:#6b7280;font-size:12px;">
                  ${footerText || `© ${new Date().getFullYear()} ${appName}.`}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `.trim();

    const textHeader = `${params.title}\n\n`;
    return { html, textHeader };
}

export function e(input?: string): string {
    return input ? escapeHtml(input) : "";
}
