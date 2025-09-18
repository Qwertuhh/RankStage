import nodemailer, { Transporter } from 'nodemailer';

let cachedTransporter: Transporter | null = null;

function required(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getMailer(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const host = required('MAILTRAP_HOST', process.env.MAILTRAP_HOST);
  const portStr = required('MAILTRAP_PORT', process.env.MAILTRAP_PORT);
  const user = required('MAILTRAP_USER', process.env.MAILTRAP_USER);
  const pass = required('MAILTRAP_PASS', process.env.MAILTRAP_PASS);

  const port = Number(portStr);

  const transporter = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass },
  });

  // Optionally verify on startup in dev to catch config errors early
  if (process.env.NODE_ENV !== 'production') {
    transporter.verify().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[mailer] Transporter verification failed:', message);
    });
  }

  cachedTransporter = transporter;
  return cachedTransporter;
}

export function getMailFrom() {
  const email = process.env.MAIL_FROM_EMAIL || 'no-reply@example.com';
  const name = process.env.MAIL_FROM_NAME || 'RankStage';
  return { name, address: email };
}
