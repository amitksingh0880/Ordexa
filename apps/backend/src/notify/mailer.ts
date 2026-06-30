import nodemailer from "nodemailer";
import { config } from "../config/env";

export interface Email {
  to: string;
  subject: string;
  html: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const smtpTransport = config.mail.smtp.host
  ? nodemailer.createTransport({
      host: config.mail.smtp.host,
      port: config.mail.smtp.port,
      secure: config.mail.smtp.secure,
      auth: { user: config.mail.smtp.user, pass: config.mail.smtp.pass },
    })
  : null;

const sendViaResend = async (email: Email): Promise<void> => {
  await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.mail.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: config.mail.from, ...email }),
  });
};

export const sendEmail = async (email: Email): Promise<void> => {
  try {
    if (smtpTransport) {
      await smtpTransport.sendMail({ from: config.mail.from, ...email });
    } else if (config.mail.resendApiKey) {
      await sendViaResend(email);
    } else {
      console.log(`✉️  [mail:log] to=${email.to} subject="${email.subject}"`);
    }
  } catch (err) {
    console.error("✉️  mail send failed:", err);
  }
};
