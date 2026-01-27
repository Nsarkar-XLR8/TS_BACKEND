import { sendEmail } from "./sendEmail";
import { renderTemplate } from "../emails/templates";
import type { TemplateName, TemplatePayloadMap } from "../emails/types";


type SendEmailInput = {
    to: string | string[];
    subject: string;
    html: string;
    text: string;
    replyTo?: string; // Allow for undefined
};

export async function sendTemplatedEmail<K extends TemplateName>(args: {
    to: string | string[];
    template: K;
    payload: TemplatePayloadMap[K];
    replyTo?: string;
}) {
    const rendered = renderTemplate(args.template, args.payload);

    if (args.replyTo !== undefined) {
        return sendEmail({
            to: args.to,
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.text,
            replyTo: args.replyTo
        });
    } else {
        // Handle the case when replyTo is undefined
        // For example, you can remove the replyTo property from the object
        return sendEmail({
            to: args.to,
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.text
        });
    }
}
