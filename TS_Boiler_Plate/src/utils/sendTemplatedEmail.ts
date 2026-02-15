import { sendEmail } from "./sendEmail";
import { renderTemplate } from "../emails/templates";
import type { TemplateName, TemplatePayloadMap } from "../emails/types";




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
