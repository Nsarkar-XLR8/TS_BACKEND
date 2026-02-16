/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer, { type Transporter, type SendMailOptions } from "nodemailer";
import { StatusCodes } from "http-status-codes";
import config from "@/config/index.js";
import AppError from "@/errors/AppError.js";
import { logger } from "@/config/logger.js";


export type SendEmailInput = {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;

    from?: string; // defaults to config.email.from
    replyTo?: string;

    cc?: string | string[];
    bcc?: string | string[];

    attachments?: SendMailOptions["attachments"];
};

export type SendEmailResult = {
    success: true;
    messageId: string;
    accepted: string[];
    rejected: string[];
} | {
    success: false;
    error: string;
};

/**
 * Transporter should be created once and reused.
 * This improves performance and avoids connection churn.
 */
let transporter: Transporter | null = null;

function assertEmailConfig() {
    const email = (config as any).email ?? {};

    const host = email.host ?? "smtp.gmail.com";
    const port = Number(email.port ?? 587);
    const secure = Boolean(email.secure ?? false);

    const user = email.emailAddress ?? email.user;
    const pass = email.emailPass ?? email.pass;

    const from = email.from ?? user;

    if (!user || !pass) {
        throw AppError.of(StatusCodes.INTERNAL_SERVER_ERROR, "Email configuration missing", [
            { path: "EMAIL", message: "Missing EMAIL_USER/EMAIL_PASS (or config.email.emailAddress/emailPass)" }
        ]);
    }

    if (!from) {
        throw AppError.of(StatusCodes.INTERNAL_SERVER_ERROR, "Email configuration missing", [
            { path: "EMAIL_FROM", message: "Missing EMAIL_FROM (or config.email.from)" }
        ]);
    }

    return { host, port, secure, user, pass, from };
}

function getTransporter(): Transporter {
    if (transporter) return transporter;

    const { host, port, secure, user, pass } = assertEmailConfig();

    transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },

        /**
         * Do NOT disable TLS verification in production.
         * If you really need it locally, control it via env and keep default secure behavior.
         */
        tls: {
            rejectUnauthorized: (process.env.NODE_ENV ?? "development") === "production"
        }
    });

    return transporter;
}



/**
 * Sends email via SMTP.
 * - Returns success/failure result
 * - Does NOT swallow misconfiguration
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    const { from: defaultFrom } = assertEmailConfig();

    const mail: SendMailOptions = {
        from: input.from ?? defaultFrom,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
        cc: input.cc,
        bcc: input.bcc,
        attachments: input.attachments
    };

    try {
        const t = getTransporter();

        // Optional: verify connection in production (costs a small network call)
        if ((process.env.NODE_ENV ?? "development") === "production") {
            await t.verify();
        }

        const info = await t.sendMail(mail);

        logger.info(
            {
                messageId: info.messageId,
                accepted: info.accepted,
                rejected: info.rejected
            },
            "Email sent"
        );

        return {
            success: true,
            messageId: info.messageId,
            accepted: (info.accepted ?? []).map(String),
            rejected: (info.rejected ?? []).map(String)
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Email send failed";

        logger.error({ err }, "Email send failed");

        // For a boilerplate: return a failure object.
        // If you prefer fail-fast: throw AppError.of(StatusCodes.BAD_GATEWAY, ...)
        return { success: false, error: message };
    }
}
