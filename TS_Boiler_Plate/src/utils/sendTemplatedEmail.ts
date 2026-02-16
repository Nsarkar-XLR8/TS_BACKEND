import { sendEmail } from "./sendEmail.js";
import { renderTemplate } from "../emails/templates/index.js";
import type { TemplateName, TemplatePayloadMap } from "../emails/types.js";




export async function sendTemplatedEmail<K extends TemplateName>(args: {
    to: string | string[];
    template: K;
    payload: TemplatePayloadMap[K];
    replyTo?: string;
}) {
    const rendered = renderTemplate(args.template, args.payload);

    if (args.replyTo === undefined) {
        return sendEmail({
            to: args.to,
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.text
        });
    }

    return sendEmail({
        to: args.to,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        replyTo: args.replyTo
    });
}
