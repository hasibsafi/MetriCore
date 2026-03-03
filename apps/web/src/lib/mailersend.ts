import nodemailer from "nodemailer";

type MailerSendEmailPayload = {
  from: {
    email: string;
    name?: string;
  };
  to: Array<{ email: string; name?: string }>;
  subject: string;
  text: string;
  html: string;
};

const MAILERSEND_API_URL = "https://api.mailersend.com/v1/email";

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
};

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.MAILERSEND_SMTP_HOST;
  const portRaw = process.env.MAILERSEND_SMTP_PORT;
  const user = process.env.MAILERSEND_SMTP_USER;
  const pass = process.env.MAILERSEND_SMTP_PASS;

  if (!host || !portRaw || !user || !pass) {
    return null;
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) {
    return null;
  }

  const secure = process.env.MAILERSEND_SMTP_SECURE
    ? process.env.MAILERSEND_SMTP_SECURE === "true"
    : port === 465;

  return { host, port, user, pass, secure };
}

export function canSendPasswordResetEmail(): boolean {
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
  const hasApi = Boolean(process.env.MAILERSEND_API_KEY);
  const hasSmtp = Boolean(getSmtpConfig());

  return Boolean(fromEmail && (hasApi || hasSmtp));
}

export async function sendPasswordResetEmail(input: { toEmail: string; resetUrl: string }) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
  const smtpConfig = getSmtpConfig();

  if (!fromEmail || (!apiKey && !smtpConfig)) {
    throw new Error("MailerSend credentials are not configured.");
  }

  const fromName = process.env.MAILERSEND_FROM_NAME ?? "MetriCore";
  const subject = "Reset your MetriCore password";
  const text = `Reset your password using this link: ${input.resetUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = `
    <p>We received a request to reset your MetriCore password.</p>
    <p><a href="${input.resetUrl}">Reset your password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  if (smtpConfig) {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass
      }
    });

    await transporter.sendMail({
      from: {
        address: fromEmail,
        name: fromName
      },
      to: input.toEmail,
      replyTo: fromEmail,
      subject,
      text,
      html
    });

    return;
  }

  const payload: MailerSendEmailPayload = {
    from: {
      email: fromEmail,
      name: fromName
    },
    to: [{ email: input.toEmail }],
    subject,
    text,
    html
  };

  const response = await fetch(MAILERSEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MailerSend error: ${response.status} ${body}`);
  }
}
