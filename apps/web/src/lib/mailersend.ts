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

export function canSendPasswordResetEmail(): boolean {
  return Boolean(process.env.MAILERSEND_API_KEY && process.env.MAILERSEND_FROM_EMAIL);
}

export async function sendPasswordResetEmail(input: { toEmail: string; resetUrl: string }) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
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
